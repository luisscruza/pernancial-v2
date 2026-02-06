<?php

declare(strict_types=1);

use App\Ai\Agents\FinanceAgent;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Laravel\Ai\Prompts\AgentPrompt;

it('prompts the finance agent and replies in the owner chat', function () {
    config()->set('services.telegram.bot_token', 'test-bot-token');
    config()->set('services.telegram.webhook_secret', 'test-secret');
    config()->set('services.telegram.owner_chat_id', '12345');

    $owner = User::factory()->create(['email' => 'owner@example.com']);
    config()->set('services.telegram.owner_email', $owner->email);

    FinanceAgent::fake(['Gasto registrado correctamente.']);

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $this->postJson(
        route('telegram.webhook'),
        [
            'update_id' => 1,
            'message' => [
                'message_id' => 2,
                'chat' => ['id' => '12345'],
                'text' => 'Add expense 12.50 for coffee from Cash',
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-secret'],
    )->assertSuccessful();

    FinanceAgent::assertPrompted('Add expense 12.50 for coffee from Cash');

    Http::assertSent(function ($request): bool {
        return $request->url() === 'https://api.telegram.org/bottest-bot-token/sendMessage'
            && (string) $request['chat_id'] === '12345'
            && str_contains((string) $request['text'], 'Gasto registrado correctamente.');
    });
});

it('rejects non owner chats', function () {
    config()->set('services.telegram.bot_token', 'test-bot-token');
    config()->set('services.telegram.webhook_secret', 'test-secret');
    config()->set('services.telegram.owner_chat_id', '12345');
    config()->set('services.telegram.owner_email', 'owner@example.com');

    User::factory()->create(['email' => 'owner@example.com']);

    FinanceAgent::fake();

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $this->postJson(
        route('telegram.webhook'),
        [
            'update_id' => 1,
            'message' => [
                'message_id' => 2,
                'chat' => ['id' => '99999'],
                'text' => 'Add income 900',
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-secret'],
    )->assertSuccessful();

    FinanceAgent::assertNeverPrompted();

    Http::assertSent(function ($request): bool {
        return (string) $request['chat_id'] === '99999'
            && str_contains((string) $request['text'], 'Acceso denegado');
    });
});

it('resets the remembered conversation with reset command', function () {
    config()->set('services.telegram.bot_token', 'test-bot-token');
    config()->set('services.telegram.webhook_secret', 'test-secret');
    config()->set('services.telegram.owner_chat_id', '12345');
    config()->set('services.telegram.owner_email', 'owner@example.com');

    User::factory()->create(['email' => 'owner@example.com']);

    Cache::forever('telegram:finance:conversation:12345', 'conversation-id');

    FinanceAgent::fake();

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $this->postJson(
        route('telegram.webhook'),
        [
            'update_id' => 1,
            'message' => [
                'message_id' => 2,
                'chat' => ['id' => '12345'],
                'text' => '/reset',
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-secret'],
    )->assertSuccessful();

    expect(Cache::get('telegram:finance:conversation:12345'))->toBeNull();

    FinanceAgent::assertNeverPrompted();
});

it('continues the cached conversation id for the telegram chat', function () {
    config()->set('services.telegram.bot_token', 'test-bot-token');
    config()->set('services.telegram.webhook_secret', 'test-secret');
    config()->set('services.telegram.owner_chat_id', '12345');

    $owner = User::factory()->create(['email' => 'owner@example.com']);
    config()->set('services.telegram.owner_email', $owner->email);

    Cache::forever('telegram:finance:conversation:12345', 'conversation-123');

    FinanceAgent::fake(['Respuesta con contexto previo.']);

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $this->postJson(
        route('telegram.webhook'),
        [
            'update_id' => 1,
            'message' => [
                'message_id' => 2,
                'chat' => ['id' => '12345'],
                'text' => 'Dame mi ultimo resumen',
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-secret'],
    )->assertSuccessful();

    FinanceAgent::assertPrompted(function (AgentPrompt $prompt): bool {
        if (! method_exists($prompt->agent, 'currentConversation')) {
            return false;
        }

        return $prompt->agent->currentConversation() === 'conversation-123';
    });
});
