<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Account;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class UpdateAccountBalance implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Account $account,
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->account->update([
            'balance' => $this->account->transactions()->sum('amount'),
        ]);
    }
}
