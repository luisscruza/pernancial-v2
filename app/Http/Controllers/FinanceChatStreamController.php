<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Ai\Agents\FinanceAgent;
use App\Http\Requests\StreamFinanceChatRequest;
use App\Models\User;
use App\Services\FinanceChatService;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

final class FinanceChatStreamController
{
    public function __construct(private FinanceChatService $financeChatService) {}

    public function __invoke(StreamFinanceChatRequest $request, #[CurrentUser] User $user): JsonResponse
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(0);
        }

        /** @var array{message?: string|null, conversation_id?: string|null} $validated */
        $validated = $request->validated();

        $statementFile = $request->file('statement_file');
        $attachment = $statementFile instanceof UploadedFile ? [$statementFile] : [];

        $prompt = mb_trim((string) ($validated['message'] ?? ''));

        if ($prompt === '' && $attachment !== []) {
            $prompt = 'Analiza el archivo adjunto, detecta movimientos, marca posibles duplicados y sugiere importacion en modo preview.';
        }

        if ($prompt === '') {
            return response()->json([
                'ok' => false,
                'message' => 'Escribe un mensaje o adjunta un archivo.',
            ], 422);
        }

        $agent = new FinanceAgent($user);
        $conversationId = $this->financeChatService->resolveConversationId($user, $validated['conversation_id'] ?? null);

        if ($conversationId === null) {
            $cachedConversationId = Cache::get($this->financeChatService->conversationCacheKey($user));

            if (is_string($cachedConversationId) && $cachedConversationId !== '') {
                $conversationId = $this->financeChatService->resolveConversationId($user, $cachedConversationId);
            }
        }

        if ($conversationId !== null) {
            Cache::forever($this->financeChatService->conversationCacheKey($user), $conversationId);
            $agent->continue($conversationId, as: $user);
        } else {
            $agent->forUser($user);
        }

        try {
            $response = $agent->prompt(
                $prompt,
                attachments: $attachment,
                timeout: (int) config('ai.agent_timeouts.finance_chat', 45),
            );

            if (is_string($response->conversationId) && $response->conversationId !== '') {
                Cache::forever($this->financeChatService->conversationCacheKey($user), $response->conversationId);
            }

            $charts = $this->financeChatService->extractChartsFromToolResultCollection($response->toolResults);
            $toolMessages = $this->financeChatService->extractToolMessagesFromCollection($response->toolResults);
            $reply = mb_trim((string) $response);

            if ($reply === '') {
                if ($toolMessages !== []) {
                    $reply = implode("\n\n", $toolMessages);
                } elseif ($charts !== []) {
                    $reply = 'Aqui tienes el grafico solicitado.';
                } else {
                    $reply = 'No pude generar una respuesta. Intenta de nuevo.';
                }
            }

            Log::debug('finance-chat prompt completed', [
                'user_id' => $user->id,
                'conversation_id' => $response->conversationId,
                'prompt_preview' => Str::limit($prompt, 120),
                'text_length' => mb_strlen($reply),
                'tool_calls_count' => $response->toolCalls->count(),
                'tool_results_count' => $response->toolResults->count(),
                'charts_count' => count($charts),
                'has_attachment' => $attachment !== [],
            ]);

            return response()->json([
                'ok' => true,
                'reply' => $reply,
                'charts' => $charts,
                'conversation_id' => $response->conversationId,
            ]);
        } catch (Throwable $exception) {
            $isTimeout = $this->financeChatService->isTimeoutException($exception);

            Log::warning('finance-chat prompt failed', [
                'user_id' => $user->id,
                'prompt_preview' => Str::limit($prompt, 120),
                'error' => $exception->getMessage(),
                'is_timeout' => $isTimeout,
                'has_attachment' => $attachment !== [],
            ]);

            return response()->json([
                'ok' => false,
                'message' => $isTimeout
                    ? 'La respuesta tardó demasiado. Intenta con una petición más corta o vuelve a intentarlo.'
                    : 'No pude completar la respuesta. Intenta de nuevo.',
            ], $isTimeout ? 504 : 500);
        }
    }
}
