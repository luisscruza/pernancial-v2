<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\UpdateAccountBalance;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Console\Command;

/**
 * @codeCoverageIgnore
 */
final class TestCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 't';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'The test lab.';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $account = Account::findOrFail(2);

        $transaction = Transaction::find(10);

        UpdateAccountBalance::dispatchSync($account, $transaction);
    }
}
