<?php

declare(strict_types=1);

namespace App\Services;

use App\Ai\Agents\FinanceAgent;
use App\Ai\Tools\GenerateFinanceChartTool;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

final class FinanceChatService
{
    public function financeConversations(User $user): Collection
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

    public function conversationMessages(?string $conversationId): Collection
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

    public function resolveConversationId(User $user, ?string $conversationId): ?string
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

    public function conversationCacheKey(User $user): string
    {
        $ownerEmail = Str::lower(mb_trim((string) config('services.telegram.owner_email', '')));
        $ownerChatId = mb_trim((string) config('services.telegram.owner_chat_id', ''));

        if ($ownerEmail !== '' && $ownerChatId !== '' && hash_equals($ownerEmail, Str::lower($user->email))) {
            return "telegram:finance:conversation:{$ownerChatId}";
        }

        return "finance:chat:conversation:{$user->id}";
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function extractChartsFromToolResults(mixed $toolResultsRaw): array
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
     * @return array<int, array<string, mixed>>
     */
    public function extractChartsFromToolResultCollection(Collection $toolResults): array
    {
        $charts = [];
        $expectedToolName = class_basename(GenerateFinanceChartTool::class);

        foreach ($toolResults as $toolResult) {
            $toolName = is_object($toolResult) ? ($toolResult->name ?? null) : null;

            if ($toolName !== $expectedToolName) {
                continue;
            }

            $payload = $this->decodeChartPayload(is_object($toolResult) ? ($toolResult->result ?? null) : null);

            if ($payload !== null) {
                $charts[] = $payload;
            }
        }

        return $charts;
    }

    /**
     * @return array<int, string>
     */
    public function extractToolMessagesFromCollection(Collection $toolResults): array
    {
        $messages = [];
        $expectedToolName = class_basename(GenerateFinanceChartTool::class);

        foreach ($toolResults as $toolResult) {
            $toolName = is_object($toolResult) ? ($toolResult->name ?? null) : null;

            $rawResult = is_object($toolResult) ? ($toolResult->result ?? null) : null;

            if (! is_string($rawResult)) {
                continue;
            }

            if ($toolName === $expectedToolName && $this->decodeChartPayload($rawResult) !== null) {
                continue;
            }

            $message = mb_trim($rawResult);

            if ($message !== '') {
                $messages[] = $message;
            }
        }

        return $messages;
    }

    public function isTimeoutException(Throwable $exception): bool
    {
        $timeoutClasses = [
            \Illuminate\Http\Client\ConnectionException::class,
        ];

        foreach ($timeoutClasses as $timeoutClass) {
            if ($exception instanceof $timeoutClass) {
                return true;
            }
        }

        $message = Str::lower($exception->getMessage());

        return Str::contains($message, [
            'timeout',
            'timed out',
            'curl error 28',
            'operation timed out',
        ]);
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
}
