<?php

declare(strict_types=1);

namespace App\Dto;

use App\Models\Contact;
use App\Models\Currency;

final readonly class CreateReceivableSeriesDto
{
    /**
     * Create a new class instance.
     *
     * @param  array<string, mixed>|null  $recurrence_rule
     */
    public function __construct(
        public Contact $contact,
        public Currency $currency,
        public string $name,
        public float $default_amount,
        public bool $is_recurring,
        public ?array $recurrence_rule,
        public ?string $next_due_date,
    ) {
        //
    }
}
