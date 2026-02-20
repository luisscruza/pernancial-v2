<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Contact;
use App\Models\User;

final class CreateContactAction
{
    /**
     * Create a new contact for the given user.
     *
     * @param  array{name: string, email?: string|null, phone?: string|null, notes?: string|null}  $data
     */
    public function handle(User $user, array $data): Contact
    {
        return $user->contacts()->create([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
    }
}
