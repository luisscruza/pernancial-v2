<?php

declare(strict_types=1);

namespace App\Dto;

use App\Models\Contact;
use App\Models\Currency;
use App\Models\PayableSeries;
use App\Models\Transaction;

final readonly class CreatePayableDto
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
        public ?PayableSeries $series = null,
        public ?Transaction $origin_transaction = null,
    ) {
        //
    }
}
