<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Ai\Agents\FinanceAgent;
use App\Models\User;
use Illuminate\Http\Client\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Ai\Transcription;
use Throwable;

final class TelegramWebhookController
{
    public function __invoke(Request $request): JsonResponse
    {
        if (! $this->hasValidWebhookSecret($request)) {
            return response()->json(['ok' => true]);
        }

        /** @var array<string, mixed> $message */
        $message = (array) data_get($request->all(), 'message', []);
        $chatId = (string) data_get($request->all(), 'message.chat.id', '');

        if ($chatId === '') {
            return response()->json(['ok' => true]);
        }

        if (! $this->isAuthorizedChat($chatId)) {
            $this->sendMessage($chatId, 'Acceso denegado. Este bot esta configurado para un unico chat propietario.');

            return response()->json(['ok' => true]);
        }

        $messageText = $this->resolveIncomingMessageText($message);

        if ($messageText === '') {
            if ($this->hasVoiceMessage($message)) {
                $this->sendMessage($chatId, 'No pude transcribir la nota de voz. Intenta de nuevo o enviame el texto.');
            }

            return response()->json(['ok' => true]);
        }

        if (Str::startsWith($messageText, '/start') || Str::startsWith($messageText, '/help')) {
            $this->sendMessage($chatId, $this->helpMessage());

            return response()->json(['ok' => true]);
        }

        if (Str::startsWith($messageText, '/reset')) {
            Cache::forget($this->conversationCacheKey($chatId));
            $this->sendMessage($chatId, 'Contexto de conversacion reiniciado. Puedes empezar una nueva solicitud financiera cuando quieras.');

            return response()->json(['ok' => true]);
        }

        $owner = $this->ownerUser();

        if (! $owner) {
            $this->sendMessage($chatId, 'El propietario del bot no esta configurado. Define primero TELEGRAM_OWNER_EMAIL.');

            return response()->json(['ok' => true]);
        }

        $agent = new FinanceAgent($owner);

        $conversationId = Cache::get($this->conversationCacheKey($chatId));

        if (is_string($conversationId) && $conversationId !== '') {
            $agent->continue($conversationId, as: $owner);
        } else {
            $agent->forUser($owner);
        }

        $response = $agent->prompt($messageText);

        if (is_string($response->conversationId) && $response->conversationId !== '') {
            Cache::forever($this->conversationCacheKey($chatId), $response->conversationId);
        }

        $reply = $this->strip((string) $response);

        if ($reply === '') {
            $reply = 'No pude generar una respuesta. Intentalo de nuevo.';
        }

        $this->sendMessage($chatId, $reply);

        return response()->json(['ok' => true]);
    }

    private function hasValidWebhookSecret(Request $request): bool
    {
        $expectedSecret = (string) config('services.telegram.webhook_secret');

        if ($expectedSecret === '') {
            return true;
        }

        $incomingSecret = (string) $request->header('X-Telegram-Bot-Api-Secret-Token', '');

        return hash_equals($expectedSecret, $incomingSecret);
    }

    private function isAuthorizedChat(string $chatId): bool
    {
        $ownerChatId = $this->strip((string) config('services.telegram.owner_chat_id', ''));

        return $ownerChatId !== '' && hash_equals($ownerChatId, $chatId);
    }

    private function ownerUser(): ?User
    {
        $ownerEmail = $this->strip((string) config('services.telegram.owner_email'));

        if ($ownerEmail === '') {
            return null;
        }

        return User::query()->where('email', $ownerEmail)->first();
    }

    private function sendMessage(string $chatId, string $message): void
    {
        $token = $this->strip((string) config('services.telegram.bot_token'));

        if ($token === '') {
            return;
        }

        $formattedMessage = Str::limit($message, 4000);

        /** @var Response $response */
        $response = Http::asForm()->timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $formattedMessage,
            'parse_mode' => 'Markdown',
            'disable_web_page_preview' => true,
        ]);

        if ($response->successful()) {
            return;
        }

        Http::asForm()->timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $this->stripTelegramMarkdown($formattedMessage),
            'disable_web_page_preview' => true,
        ]);
    }

    private function conversationCacheKey(string $chatId): string
    {
        return "telegram:finance:conversation:{$chatId}";
    }

    private function helpMessage(): string
    {
        return implode("\n", [
            'Hola. Puedo ayudarte a gestionar tus finanzas.',
            '',
            'Ejemplos:',
            '- "Registra un gasto de 12.50 por cafe en la cuenta Efectivo categoria Comida hoy"',
            '- "Agrega un ingreso de 1200 de salario a la cuenta Banco el 2026-02-01"',
            '- "Transfiere 200 desde la cuenta Efectivo a la cuenta Ahorros"',
            '',
            'Comandos:',
            '- /help: muestra este mensaje',
            '- /reset: limpia el contexto de la conversacion',
        ]);
    }

    private function strip(string $value): string
    {
        return preg_replace('/^\s+|\s+$/u', '', $value) ?? $value;
    }

    private function stripTelegramMarkdown(string $message): string
    {
        return str_replace(['*', '_', '`'], '', $message);
    }

    /**
     * @param  array<string, mixed>  $message
     */
    private function resolveIncomingMessageText(array $message): string
    {
        $messageText = $this->strip((string) data_get($message, 'text', ''));

        if ($messageText !== '') {
            return $messageText;
        }

        $voiceFileId = $this->strip((string) data_get($message, 'voice.file_id', ''));

        if ($voiceFileId === '') {
            return '';
        }

        $voiceMimeType = $this->strip((string) data_get($message, 'voice.mime_type', ''));

        return $this->transcribeVoiceFile($voiceFileId, $voiceMimeType !== '' ? $voiceMimeType : null);
    }

    /**
     * @param  array<string, mixed>  $message
     */
    private function hasVoiceMessage(array $message): bool
    {
        return $this->strip((string) data_get($message, 'voice.file_id', '')) !== '';
    }

    private function transcribeVoiceFile(string $voiceFileId, ?string $mimeType = null): string
    {
        $token = $this->strip((string) config('services.telegram.bot_token'));

        if ($token === '') {
            return '';
        }

        try {
            /** @var Response $fileResponse */
            $fileResponse = Http::asForm()->timeout(15)->post("https://api.telegram.org/bot{$token}/getFile", [
                'file_id' => $voiceFileId,
            ]);

            if (! $fileResponse->successful()) {
                return '';
            }

            $filePath = $this->strip((string) data_get($fileResponse->json(), 'result.file_path', ''));

            if ($filePath === '') {
                return '';
            }

            /** @var Response $audioResponse */
            $audioResponse = Http::timeout(30)->get("https://api.telegram.org/file/bot{$token}/{$filePath}");

            if (! $audioResponse->successful()) {
                return '';
            }

            $temporaryPath = tempnam(sys_get_temp_dir(), 'telegram-voice-');

            if ($temporaryPath === false) {
                return '';
            }

            try {
                $bytesWritten = file_put_contents($temporaryPath, $audioResponse->body());

                if ($bytesWritten === false || $bytesWritten === 0) {
                    return '';
                }

                return $this->strip((string) Transcription::fromPath($temporaryPath, $mimeType)->generate());
            } finally {
                @unlink($temporaryPath);
            }
        } catch (Throwable $e) {

            return '';
        }
    }
}
