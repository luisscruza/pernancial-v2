<?php

declare(strict_types=1);

namespace App\Dto;

use App\Models\Contact;
use App\Models\Currency;

final readonly class UpdatePayableDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public Contact $contact,
        public Currency $currency,
        public float $amount_total,
        public string $due_date,
        public ?string $description = null,
    ) {
        //
    }
}
