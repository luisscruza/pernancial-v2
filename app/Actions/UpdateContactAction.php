<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Contact;

final class UpdateContactAction
{
    /**
     * Update the specified contact.
     *
     * @param  array{name: string, email?: string|null, phone?: string|null, notes?: string|null}  $data
     */
    public function handle(Contact $contact, array $data): Contact
    {
        $contact->update([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return $contact->fresh();
    }
}
