<?php

declare(strict_types=1);

use App\Actions\CreateContactAction;
use App\Models\Contact;
use App\Models\User;

it('creates a contact with optional fields defaulted to null', function () {
    $user = User::factory()->create();

    $action = app(CreateContactAction::class);

    $contact = $action->handle($user, [
        'name' => 'Taylor Example',
    ]);

    expect($contact)->toBeInstanceOf(Contact::class)
        ->and($contact->user_id)->toBe($user->id)
        ->and($contact->name)->toBe('Taylor Example')
        ->and($contact->email)->toBeNull()
        ->and($contact->phone)->toBeNull()
        ->and($contact->notes)->toBeNull();

    $this->assertDatabaseHas('contacts', [
        'id' => $contact->id,
        'user_id' => $user->id,
        'name' => 'Taylor Example',
    ]);
});
