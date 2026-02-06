<?php

declare(strict_types=1);

use App\Ai\Agents\FinanceAgent;
use App\Models\Account;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Ai\Prompts\AgentPrompt;

test('user can view finance chat page', function () {
    $user = createOnboardedUser();

    $this->actingAs($user)
        ->get(route('finance.chat'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('finance/chat')
            ->has('conversations', 0)
            ->where('activeConversationId', null)
            ->has('initialMessages', 0));
});

test('user can view the latest fifty finance chat messages', function () {
    $user = createOnboardedUser();
    $conversationId = seedFinanceConversation($user, 60);

    Cache::forever("finance:chat:conversation:{$user->id}", $conversationId);

    $this->actingAs($user)
        ->get(route('finance.chat'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('finance/chat')
            ->has('conversations', 1)
            ->where('activeConversationId', $conversationId)
            ->has('initialMessages', 50)
            ->where('initialMessages.0.content', 'Mensaje 11')
            ->where('initialMessages.49.content', 'Mensaje 60'));
});

test('user can view chart payloads stored in finance chat tool results', function () {
    $user = createOnboardedUser();
    $conversationId = (string) Str::uuid7();

    DB::table('agent_conversations')->insert([
        'id' => $conversationId,
        'user_id' => $user->id,
        'title' => 'Graficos',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $chartPayload = [
        'version' => 1,
        'kind' => 'bar',
        'title' => 'Gasto por categoria',
        'series' => [
            [
                'key' => 'amount',
                'label' => 'Monto',
                'color' => '#2563eb',
            ],
        ],
        'points' => [
            [
                'label' => 'Food',
                'amount' => 55,
            ],
        ],
    ];

    DB::table('agent_conversation_messages')->insert([
        'id' => (string) Str::uuid7(),
        'conversation_id' => $conversationId,
        'user_id' => $user->id,
        'agent' => FinanceAgent::class,
        'role' => 'assistant',
        'content' => 'Aqui tienes el grafico.',
        'attachments' => '[]',
        'tool_calls' => '[]',
        'tool_results' => json_encode([
            [
                'id' => 'tool_1',
                'name' => 'GenerateFinanceChartTool',
                'arguments' => [],
                'result' => json_encode($chartPayload),
                'result_id' => null,
            ],
        ]),
        'usage' => '[]',
        'meta' => '[]',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    Cache::forever("finance:chat:conversation:{$user->id}", $conversationId);

    $this->actingAs($user)
        ->get(route('finance.chat'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('finance/chat')
            ->where('activeConversationId', $conversationId)
            ->where('initialMessages.0.role', 'assistant')
            ->where('initialMessages.0.charts.0.kind', 'bar')
            ->where('initialMessages.0.charts.0.points.0.label', 'Food'));
});

test('user can stream finance chat responses for a selected conversation', function () {
    $user = createOnboardedUser();
    $conversationId = seedFinanceConversation($user, 3);

    FinanceAgent::fake(['Listo. Registre el gasto correctamente.']);

    $this->actingAs($user)
        ->postJson(route('finance.chat.stream'), [
            'message' => 'Registra un gasto de 12 por cafe en Efectivo.',
            'conversation_id' => $conversationId,
        ])
        ->assertOk();

    FinanceAgent::assertPrompted(function (AgentPrompt $prompt) use ($conversationId): bool {
        if (! method_exists($prompt->agent, 'currentConversation')) {
            return false;
        }

        return $prompt->agent->currentConversation() === $conversationId;
    });

    expect(Cache::get("finance:chat:conversation:{$user->id}"))->toBe($conversationId);
});

test('finance chat stream validates the message', function () {
    $user = createOnboardedUser();

    $this->actingAs($user)
        ->postJson(route('finance.chat.stream'), [
            'message' => ' ',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['message']);
});

test('user can reset the finance chat conversation', function () {
    $user = createOnboardedUser();

    Cache::forever("finance:chat:conversation:{$user->id}", 'conversation-id');

    $this->actingAs($user)
        ->postJson(route('finance.chat.reset'))
        ->assertOk()
        ->assertJson(['ok' => true]);

    expect(Cache::get("finance:chat:conversation:{$user->id}"))->toBeNull();
});

test('user can rename a finance chat conversation', function () {
    $user = createOnboardedUser();
    $conversationId = seedFinanceConversation($user, 1);

    $this->actingAs($user)
        ->patchJson(route('finance.chat.rename', ['conversation' => $conversationId]), [
            'title' => 'Resumen anual de gastos',
        ])
        ->assertOk()
        ->assertJson(['ok' => true]);

    $title = DB::table('agent_conversations')->where('id', $conversationId)->value('title');

    expect($title)->toBe('Resumen anual de gastos');
});

test('user can delete a finance chat conversation', function () {
    $user = createOnboardedUser();
    $conversationId = seedFinanceConversation($user, 4);

    Cache::forever("finance:chat:conversation:{$user->id}", $conversationId);

    $this->actingAs($user)
        ->deleteJson(route('finance.chat.destroy', ['conversation' => $conversationId]))
        ->assertOk()
        ->assertJson(['ok' => true]);

    expect(DB::table('agent_conversations')->where('id', $conversationId)->exists())->toBeFalse()
        ->and(DB::table('agent_conversation_messages')->where('conversation_id', $conversationId)->count())->toBe(0)
        ->and(Cache::get("finance:chat:conversation:{$user->id}"))->toBeNull();
});

test('user cannot delete another users finance chat conversation', function () {
    $owner = createOnboardedUser();
    $intruder = createOnboardedUser();
    $conversationId = seedFinanceConversation($owner, 2);

    $this->actingAs($intruder)
        ->deleteJson(route('finance.chat.destroy', ['conversation' => $conversationId]))
        ->assertNotFound();

    expect(DB::table('agent_conversations')->where('id', $conversationId)->exists())->toBeTrue();
});

function createOnboardedUser(): User
{
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();

    return $user;
}

function seedFinanceConversation(User $user, int $messagesCount = 1): string
{
    $conversationId = (string) Str::uuid7();

    DB::table('agent_conversations')->insert([
        'id' => $conversationId,
        'user_id' => $user->id,
        'title' => 'Chat de finanzas',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    foreach (range(1, $messagesCount) as $index) {
        DB::table('agent_conversation_messages')->insert([
            'id' => (string) Str::uuid7(),
            'conversation_id' => $conversationId,
            'user_id' => $user->id,
            'agent' => FinanceAgent::class,
            'role' => $index % 2 === 0 ? 'assistant' : 'user',
            'content' => "Mensaje {$index}",
            'attachments' => '[]',
            'tool_calls' => '[]',
            'tool_results' => '[]',
            'usage' => '[]',
            'meta' => '[]',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    return $conversationId;
}
