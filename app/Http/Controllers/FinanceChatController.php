<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FinanceChatService;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

final class FinanceChatController
{
    public function __construct(private FinanceChatService $financeChatService) {}

    public function index(Request $request, #[CurrentUser] User $user): Response
    {
        $conversations = $this->financeChatService->financeConversations($user);

        $requestedConversationId = mb_trim((string) $request->query('conversation', ''));
        $activeConversationId = $this->financeChatService->resolveConversationId(
            $user,
            $requestedConversationId !== '' ? $requestedConversationId : null,
        );

        if ($activeConversationId === null) {
            $cachedConversationId = Cache::get($this->financeChatService->conversationCacheKey($user));

            if (is_string($cachedConversationId) && $cachedConversationId !== '') {
                $activeConversationId = $this->financeChatService->resolveConversationId($user, $cachedConversationId);
            }
        }

        if ($activeConversationId === null && $conversations->isNotEmpty()) {
            /** @var array{id: string} $firstConversation */
            $firstConversation = $conversations->first();
            $activeConversationId = $firstConversation['id'];
        }

        if ($activeConversationId !== null) {
            Cache::forever($this->financeChatService->conversationCacheKey($user), $activeConversationId);
        } else {
            Cache::forget($this->financeChatService->conversationCacheKey($user));
        }

        return Inertia::render('finance/chat', [
            'conversations' => fn (): Collection => $conversations,
            'activeConversationId' => $activeConversationId,
            'initialMessages' => fn (): Collection => $this->financeChatService->conversationMessages($activeConversationId),
        ]);
    }
}
