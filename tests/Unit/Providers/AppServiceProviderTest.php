<?php

declare(strict_types=1);

use App\Providers\AppServiceProvider;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;

beforeEach(function () {
    // Clear any previous mock configurations
    Mockery::close();
});

test('urls are forced to https in production', function () {
    // Mock App facade to simulate production environment
    App::partialMock()
        ->shouldReceive('isProduction')
        ->zeroOrMoreTimes()
        ->andReturn(true);

    // Expect URL facade to receive forceScheme with https
    URL::shouldReceive('forceScheme')
        ->once()
        ->with('https');

    // Create and boot the service provider
    $provider = new AppServiceProvider(app());
    $provider->boot();
});

test('urls are not forced to https in non-production', function () {
    // Mock App facade to simulate non-production environment
    App::partialMock()
        ->shouldReceive('isProduction')
        ->zeroOrMoreTimes()
        ->andReturn(false);

    // Expect URL facade to not receive forceScheme
    URL::shouldReceive('forceScheme')->never();

    // Create and boot the service provider
    $provider = new AppServiceProvider(app());
    $provider->boot();
});

test('dates use carbon immutable', function () {
    Date::shouldReceive('use')
        ->once()
        ->with(CarbonImmutable::class);

    $provider = new AppServiceProvider(app());
    $provider->boot();
});

test('vite uses aggressive prefetching', function () {
    Vite::shouldReceive('useAggressivePrefetching')
        ->once();

    $provider = new AppServiceProvider(app());
    $provider->boot();
});
