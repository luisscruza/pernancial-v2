<?php

declare(strict_types=1);

namespace Tests\Feature\Http\Controllers;

use App\Models\Category;
use App\Models\User;

test('onboarding redirects to categories if user has no categories', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('onboarding'));

    expect($response->status())->toBe(302)
        ->and($response->headers->get('Location'))->toBe(route('onboarding.categories'));
});

test('onboarding redirects to accounts if user has categories', function () {
    $user = User::factory()->create();
    Category::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('onboarding'));

    expect($response->status())->toBe(302)
        ->and($response->headers->get('Location'))->toBe(route('onboarding.accounts'));
});
