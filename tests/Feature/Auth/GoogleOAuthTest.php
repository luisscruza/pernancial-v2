<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->mockSocialite = Mockery::mock(GoogleProvider::class);
    Socialite::shouldReceive('driver')->with('google')->andReturn($this->mockSocialite);
});

test('user can be redirected to google oauth', function () {
    $this->mockSocialite->shouldReceive('redirect')
        ->once()
        ->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

    $response = $this->get(route('auth.google'));

    $response->assertRedirect();
    $response->assertLocation('https://accounts.google.com/o/oauth2/auth');
});

test('new user can be created from google oauth callback', function () {
    $socialiteUser = new SocialiteUser();
    $socialiteUser->id = '123456789';
    $socialiteUser->name = 'Test User';
    $socialiteUser->email = 'test@example.com';

    $this->mockSocialite->shouldReceive('user')
        ->once()
        ->andReturn($socialiteUser);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('accounts'));

    $user = User::where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Test User')
        ->and($user->google_id)->toBe('123456789')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and(Auth::check())->toBeTrue();
});

test('existing user can login with google oauth callback', function () {
    $existingUser = User::factory()->create([
        'email' => 'existing@example.com',
        'google_id' => '123456789',
    ]);

    $socialiteUser = new SocialiteUser();
    $socialiteUser->id = '123456789';
    $socialiteUser->name = 'Existing User';
    $socialiteUser->email = 'existing@example.com';

    $this->mockSocialite->shouldReceive('user')
        ->once()
        ->andReturn($socialiteUser);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('accounts'));
    expect(Auth::id())->toBe($existingUser->id)
        ->and(User::count())->toBe(1);
});

test('google oauth callback regenerates session', function () {
    $socialiteUser = new SocialiteUser();
    $socialiteUser->id = '123456789';
    $socialiteUser->name = 'Test User';
    $socialiteUser->email = 'test@example.com';

    $this->mockSocialite->shouldReceive('user')
        ->once()
        ->andReturn($socialiteUser);

    $this->session(['key' => 'value']);
    $oldSessionId = session()->getId();

    $this->get(route('auth.google.callback'));

    expect(session()->getId())->not->toBe($oldSessionId);
});

test('google oauth callback redirects to intended url', function () {
    $socialiteUser = new SocialiteUser();
    $socialiteUser->id = '123456789';
    $socialiteUser->name = 'Test User';
    $socialiteUser->email = 'test@example.com';

    $this->mockSocialite->shouldReceive('user')
        ->once()
        ->andReturn($socialiteUser);

    session(['url.intended' => route('accounts')]);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('accounts'));
});
