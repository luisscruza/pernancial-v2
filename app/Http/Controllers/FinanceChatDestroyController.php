<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FinanceChatService;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

final class FinanceChatDestroyController
{
    public function __construct(private FinanceChatService $financeChatService) {}

    public function __invoke(#[CurrentUser] User $user, string $conversation): JsonResponse
    {
        $conversationId = $this->financeChatService->resolveConversationId($user, $conversation);

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

        $cachedConversationId = Cache::get($this->financeChatService->conversationCacheKey($user));

        if (is_string($cachedConversationId) && $cachedConversationId !== '' && hash_equals($cachedConversationId, $conversationId)) {
            Cache::forget($this->financeChatService->conversationCacheKey($user));
        }

        return response()->json(['ok' => true]);
    }
}
