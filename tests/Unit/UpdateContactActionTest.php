<?php

declare(strict_types=1);

use App\Actions\UpdateContactAction;
use App\Models\Contact;

it('updates a contact and returns a fresh model', function () {
    $contact = Contact::factory()->create([
        'name' => 'Before',
        'email' => 'before@example.com',
        'phone' => '123',
        'notes' => 'Old note',
    ]);

    $action = app(UpdateContactAction::class);

    $updated = $action->handle($contact, [
        'name' => 'After',
        'email' => null,
        'phone' => '555-0100',
        'notes' => null,
    ]);

    expect($updated)->toBeInstanceOf(Contact::class)
        ->and($updated->id)->toBe($contact->id)
        ->and($updated->name)->toBe('After')
        ->and($updated->email)->toBeNull()
        ->and($updated->phone)->toBe('555-0100')
        ->and($updated->notes)->toBeNull();

    $this->assertDatabaseHas('contacts', [
        'id' => $contact->id,
        'name' => 'After',
        'email' => null,
        'phone' => '555-0100',
        'notes' => null,
    ]);
});
