<?php

declare(strict_types=1);

namespace Tests\Feature\Http\Controllers;

use App\Models\User;

test('users can view onboarding categories page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('onboarding.categories'));

    expect($response->status())->toBe(200);
});

test('users can store onboarding categories', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('onboarding.categories.store'), [
        'categories' => [
            [
                'name' => 'Test Category',
                'emoji' => '🔍',
                'type' => 'expense',
            ],
        ],
    ]);

    expect($response->status())->toBe(302)
        ->and($response->headers->get('Location'))->toBe(route('onboarding.accounts'));

    expect($user->categories)->toHaveCount(1)
        ->and($user->categories->first()->name)->toBe('Test Category')
        ->and($user->categories->first()->emoji)->toBe('🔍');
});

it('redirects to the accounts onboarding page if the user has at least one category', function () {
    $user = User::factory()->create();

    $user->categories()->create([
        'name' => 'Test Category',
        'emoji' => '🔍',
        'type' => 'expense',
    ]);

    $response = $this->actingAs($user)->get(route('onboarding.categories'));

    expect($response->status())->toBe(302)
        ->and($response->headers->get('Location'))->toBe(route('onboarding.accounts'));
});
