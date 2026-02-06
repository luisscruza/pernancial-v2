<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Ai\Agents\FinanceAgent;
use App\Ai\Tools\GenerateFinanceChartTool;
use App\Http\Requests\StreamFinanceChatRequest;
use App\Http\Requests\UpdateFinanceConversationTitleRequest;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class FinanceChatController
{
    public function index(Request $request, #[CurrentUser] User $user): Response
    {
        $conversations = $this->financeConversations($user);

        $requestedConversationId = mb_trim((string) $request->query('conversation', ''));
        $activeConversationId = $this->resolveConversationId(
            $user,
            $requestedConversationId !== '' ? $requestedConversationId : null,
        );

        if ($activeConversationId === null) {
            $cachedConversationId = Cache::get($this->conversationCacheKey($user));

            if (is_string($cachedConversationId) && $cachedConversationId !== '') {
                $activeConversationId = $this->resolveConversationId($user, $cachedConversationId);
            }
        }

        if ($activeConversationId === null && $conversations->isNotEmpty()) {
            /** @var array{id: string} $firstConversation */
            $firstConversation = $conversations->first();
            $activeConversationId = $firstConversation['id'];
        }

        if ($activeConversationId !== null) {
            Cache::forever($this->conversationCacheKey($user), $activeConversationId);
        } else {
            Cache::forget($this->conversationCacheKey($user));
        }

        return Inertia::render('finance/chat', [
            'conversations' => fn (): Collection => $conversations,
            'activeConversationId' => $activeConversationId,
            'initialMessages' => fn (): Collection => $this->conversationMessages($activeConversationId),
        ]);
    }

    public function stream(StreamFinanceChatRequest $request, #[CurrentUser] User $user): Responsable
    {
        set_time_limit(0);

        /** @var array{message: string, conversation_id?: string|null} $validated */
        $validated = $request->validated();

        $agent = new FinanceAgent($user);
        $conversationId = $this->resolveConversationId($user, $validated['conversation_id'] ?? null);

        if ($conversationId === null) {
            $cachedConversationId = Cache::get($this->conversationCacheKey($user));

            if (is_string($cachedConversationId) && $cachedConversationId !== '') {
                $conversationId = $this->resolveConversationId($user, $cachedConversationId);
            }
        }

        if ($conversationId !== null) {
            Cache::forever($this->conversationCacheKey($user), $conversationId);
            $agent->continue($conversationId, as: $user);
        } else {
            $agent->forUser($user);
        }

        return $agent
            ->stream($validated['message'])
            ->then(function ($response) use ($user, $validated): void {
                if (is_string($response->conversationId) && $response->conversationId !== '') {
                    Cache::forever($this->conversationCacheKey($user), $response->conversationId);
                }

                $toolResultSummaries = $response->toolResults
                    ->map(function ($toolResult): array {
                        $rawResult = is_string($toolResult->result)
                            ? $toolResult->result
                            : json_encode($toolResult->result, JSON_UNESCAPED_SLASHES);

                        return [
                            'name' => $toolResult->name,
                            'preview' => Str::limit((string) ($rawResult ?? ''), 180),
                        ];
                    })
                    ->all();

                Log::debug('finance-chat stream completed', [
                    'user_id' => $user->id,
                    'conversation_id' => $response->conversationId,
                    'prompt_preview' => Str::limit($validated['message'], 120),
                    'text_length' => mb_strlen(mb_trim((string) $response->text)),
                    'tool_calls_count' => $response->toolCalls->count(),
                    'tool_results_count' => $response->toolResults->count(),
                    'tool_results' => $toolResultSummaries,
                ]);
            });
    }

    public function reset(#[CurrentUser] User $user): JsonResponse
    {
        Cache::forget($this->conversationCacheKey($user));

        return response()->json(['ok' => true]);
    }

    public function rename(
        UpdateFinanceConversationTitleRequest $request,
        #[CurrentUser] User $user,
        string $conversation,
    ): JsonResponse {
        $conversationId = $this->resolveConversationId($user, $conversation);

        if ($conversationId === null) {
            abort(404);
        }

        /** @var array{title: string} $validated */
        $validated = $request->validated();

        DB::table('agent_conversations')
            ->where('id', $conversationId)
            ->where('user_id', $user->id)
            ->update([
                'title' => $validated['title'],
                'updated_at' => now(),
            ]);

        return response()->json(['ok' => true]);
    }

    public function destroy(#[CurrentUser] User $user, string $conversation): JsonResponse
    {
        $conversationId = $this->resolveConversationId($user, $conversation);

        if ($conversationId === null) {
            abort(404);
        }

        DB::transaction(function () use ($conversationId, $user): void {
            DB::table('agent_conversation_messages')
                ->where('conversation_id', $conversationId)
                ->where('user_id', $user->id)
                ->delete();

            DB::table('agent_conversations')
                ->where('id', $conversationId)
                ->where('user_id', $user->id)
                ->delete();
        });

        $cachedConversationId = Cache::get($this->conversationCacheKey($user));

        if (is_string($cachedConversationId) && $cachedConversationId !== '' && hash_equals($cachedConversationId, $conversationId)) {
            Cache::forget($this->conversationCacheKey($user));
        }

        return response()->json(['ok' => true]);
    }

    private function financeConversations(User $user): Collection
    {
        return DB::table('agent_conversations as conversations')
            ->select([
                'conversations.id',
                'conversations.title',
                'conversations.updated_at',
            ])
            ->selectSub(function ($query): void {
                $query->from('agent_conversation_messages as messages')
                    ->select('messages.content')
                    ->whereColumn('messages.conversation_id', 'conversations.id')
                    ->where('messages.agent', FinanceAgent::class)
                    ->orderByDesc('messages.created_at')
                    ->limit(1);
            }, 'preview')
            ->selectSub(function ($query): void {
                $query->from('agent_conversation_messages as messages')
                    ->selectRaw('count(*)')
                    ->whereColumn('messages.conversation_id', 'conversations.id')
                    ->where('messages.agent', FinanceAgent::class);
            }, 'message_count')
            ->where('conversations.user_id', $user->id)
            ->whereExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('agent_conversation_messages as messages')
                    ->whereColumn('messages.conversation_id', 'conversations.id')
                    ->where('messages.agent', FinanceAgent::class);
            })
            ->orderByDesc('conversations.updated_at')
            ->limit(150)
            ->get()
            ->map(function ($conversation): array {
                return [
                    'id' => (string) $conversation->id,
                    'title' => Str::limit(mb_trim((string) $conversation->title), 100),
                    'preview' => (string) Str::of((string) ($conversation->preview ?? ''))
                        ->replaceMatches('/\s+/', ' ')
                        ->trim()
                        ->limit(120),
                    'updatedAt' => (string) $conversation->updated_at,
                    'messageCount' => (int) ($conversation->message_count ?? 0),
                ];
            })
            ->values();
    }

    private function conversationMessages(?string $conversationId): Collection
    {
        if (! is_string($conversationId) || $conversationId === '') {
            return collect();
        }

        return DB::table('agent_conversation_messages')
            ->where('conversation_id', $conversationId)
            ->where('agent', FinanceAgent::class)
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($message): ?array {
                if (! in_array($message->role, ['user', 'assistant'], true)) {
                    return null;
                }

                $charts = $message->role === 'assistant'
                    ? $this->extractChartsFromToolResults($message->tool_results ?? null)
                    : [];

                $content = mb_trim((string) ($message->content ?? ''));

                if ($content === '' && $charts === []) {
                    return null;
                }

                return [
                    'role' => $message->role,
                    'content' => $content,
                    'charts' => $charts,
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function extractChartsFromToolResults(mixed $toolResultsRaw): array
    {
        if (! is_string($toolResultsRaw) || $toolResultsRaw === '') {
            return [];
        }

        $decoded = json_decode($toolResultsRaw, true);

        if (! is_array($decoded)) {
            return [];
        }

        $charts = [];
        $expectedToolName = class_basename(GenerateFinanceChartTool::class);

        foreach ($decoded as $toolResult) {
            if (! is_array($toolResult)) {
                continue;
            }

            if (($toolResult['name'] ?? null) !== $expectedToolName) {
                continue;
            }

            $payload = $this->decodeChartPayload($toolResult['result'] ?? null);

            if ($payload === null) {
                continue;
            }

            $charts[] = $payload;
        }

        return $charts;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function decodeChartPayload(mixed $result): ?array
    {
        if (is_string($result)) {
            $result = json_decode($result, true);
        }

        if (! is_array($result)) {
            return null;
        }

        if (! isset($result['kind']) || ! in_array($result['kind'], ['bar', 'line', 'stacked_bar'], true)) {
            return null;
        }

        if (! isset($result['series']) || ! is_array($result['series'])) {
            return null;
        }

        if (! isset($result['points']) || ! is_array($result['points'])) {
            return null;
        }

        return $result;
    }

    private function resolveConversationId(User $user, ?string $conversationId): ?string
    {
        if (! is_string($conversationId)) {
            return null;
        }

        $conversationId = mb_trim($conversationId);

        if ($conversationId === '') {
            return null;
        }

        if (! $this->isFinanceConversationForUser($user, $conversationId)) {
            return null;
        }

        return $conversationId;
    }

    private function isFinanceConversationForUser(User $user, string $conversationId): bool
    {
        return DB::table('agent_conversations as conversations')
            ->where('conversations.id', $conversationId)
            ->where('conversations.user_id', $user->id)
            ->whereExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('agent_conversation_messages as messages')
                    ->whereColumn('messages.conversation_id', 'conversations.id')
                    ->where('messages.agent', FinanceAgent::class);
            })
            ->exists();
    }

    private function conversationCacheKey(User $user): string
    {
        $ownerEmail = Str::lower(mb_trim((string) config('services.telegram.owner_email', '')));
        $ownerChatId = mb_trim((string) config('services.telegram.owner_chat_id', ''));

        if ($ownerEmail !== '' && $ownerChatId !== '' && hash_equals($ownerEmail, Str::lower($user->email))) {
            return "telegram:finance:conversation:{$ownerChatId}";
        }

        return "finance:chat:conversation:{$user->id}";
    }
}
