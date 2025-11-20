<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

final class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        /** @var ?User $user */
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'currency' => $user->currency,
                    'accounts' => $user->accounts()->active()->get()->map(fn($account): array => [
                        'id' => $account->id,
                        'uuid' => $account->uuid,
                        'name' => $account->name,
                        'emoji' => $account->emoji,
                        'type' => $account->type->label(),
                    ])->values(),
                ] : null,
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'base_currency' => $user ? $user->currencies()->where('is_base', true)->first() : null,
            'flash' => [
                'success' => fn(): ?string => $request->session()->get('success'),
                'error' => fn(): ?string => $request->session()->get('error'),
                'message' => fn(): ?string => $request->session()->get('message'),
            ],
        ];
    }
}
