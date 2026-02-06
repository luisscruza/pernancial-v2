<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Ai\Agents\FinanceAgent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class TelegramWebhookController
{
    public function __invoke(Request $request): JsonResponse
    {
        if (! $this->hasValidWebhookSecret($request)) {
            return response()->json(['ok' => true]);
        }

        $chatId = (string) data_get($request->all(), 'message.chat.id', '');
        $messageText = $this->strip((string) data_get($request->all(), 'message.text', ''));

        if ($chatId === '' || $messageText === '') {
            return response()->json(['ok' => true]);
        }

        if (! $this->isAuthorizedChat($chatId)) {
            $this->sendMessage($chatId, 'Access denied. This bot is configured for a single owner chat.');

            return response()->json(['ok' => true]);
        }

        if (Str::startsWith($messageText, '/start') || Str::startsWith($messageText, '/help')) {
            $this->sendMessage($chatId, $this->helpMessage());

            return response()->json(['ok' => true]);
        }

        if (Str::startsWith($messageText, '/reset')) {
            Cache::forget($this->conversationCacheKey($chatId));
            $this->sendMessage($chatId, 'Conversation context reset. Start a new finance request anytime.');

            return response()->json(['ok' => true]);
        }

        $owner = $this->ownerUser();

        if (! $owner) {
            $this->sendMessage($chatId, 'Bot owner is not configured. Set TELEGRAM_OWNER_EMAIL first.');

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
            $reply = 'I could not generate a response. Please try again.';
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

        Http::asForm()->timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => Str::limit($message, 4000),
        ]);
    }

    private function conversationCacheKey(string $chatId): string
    {
        return "telegram:finance:conversation:{$chatId}";
    }

    private function helpMessage(): string
    {
        return implode("\n", [
            'Hi. I can help you manage your finance records.',
            '',
            'Examples:',
            '- "Register expense 12.50 for coffee in account Cash category Food today"',
            '- "Add income 1200 salary to account Bank on 2026-02-01"',
            '- "Transfer 200 from account Cash to account Savings"',
            '',
            'Commands:',
            '- /help: show this message',
            '- /reset: clear conversation context',
        ]);
    }

    private function strip(string $value): string
    {
        return preg_replace('/^\s+|\s+$/u', '', $value) ?? $value;
    }
}
