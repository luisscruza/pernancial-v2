<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FinanceChatService;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

final class FinanceChatResetController
{
    public function __construct(private FinanceChatService $financeChatService) {}

    public function __invoke(#[CurrentUser] User $user): JsonResponse
    {
        Cache::forget($this->financeChatService->conversationCacheKey($user));

        return response()->json(['ok' => true]);
    }
}
