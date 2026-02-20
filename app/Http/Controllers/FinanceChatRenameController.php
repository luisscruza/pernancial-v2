<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateFinanceConversationTitleRequest;
use App\Models\User;
use App\Services\FinanceChatService;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

final class FinanceChatRenameController
{
    public function __construct(private FinanceChatService $financeChatService) {}

    public function __invoke(
        UpdateFinanceConversationTitleRequest $request,
        #[CurrentUser] User $user,
        string $conversation,
    ): JsonResponse {
        $conversationId = $this->financeChatService->resolveConversationId($user, $conversation);

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
}
