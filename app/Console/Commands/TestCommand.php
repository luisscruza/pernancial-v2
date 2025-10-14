<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\Account;
use App\Models\Budget;
use App\Models\BudgetPeriod;
use App\Models\Category;
use App\Models\Currency;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

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
        DB::table('transactions')->truncate();
        $this->importTransactions();
        $this->recalculateBalance();
    }

    private function recalculateBalance(): void
    {
        $accounts = Account::with('currency')->get();

        foreach ($accounts as $account) {
            UpdateAccountBalance::dispatchSync($account, null);
        }

    }

    private function importTransactions(): void
    {
        $path = storage_path('app/transactions.json');

        if (! is_file($path)) {
            $this->error(sprintf('File not found: %s', $path));

            return;
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        if (! is_array($data)) {
            $this->error('Invalid JSON structure');

            return;
        }

        // --- Group by "account"
        $grouped = collect($data)->groupBy('account');

        foreach ($grouped as $accountName => $items) {
            $this->info("Processing account: {$accountName}");

            // Get the account...
            $account = Account::where('name', $accountName)->first();

            foreach ($items as $item) {
                $this->processTransaction($item, $account);
            }
        }
        $this->info('Transactions imported successfully.');
    }

    private function processTransaction(array $item, ?Account $account): void
    {
        //      array:11 [
        //   "id" => 44
        //   "description" => "Lisboa"
        //   "category" => "Vacaciones"
        //   "amount" => 1.5
        //   "type" => "expense"
        //   "running_balance" => 2939.1
        //   "transaction_date" => "2024-07-30"
        //   "from_account" => null
        //   "to_account" => null
        //   "account" => "Santander (Luis)"
        //   "currency" => "EUR"
        // ] // app/Console/Commands/TestCommand.php:103

        $type = match (mb_strtolower($item['type'])) {
            'expense' => TransactionType::EXPENSE,
            'income' => TransactionType::INCOME,
            'transfer-in' => TransactionType::TRANSFER_IN,
            'transfer-out' => TransactionType::TRANSFER_OUT,
            'initial' => TransactionType::INITIAL,
            default => throw new InvalidArgumentException('Unknown transaction type: '.$item['type']),
        };

        $fromAccount = null;
        $destinationAccount = null;
        $conversionRate = 1;
        $convertedAmount = $item['amount'];

        if (! $account->currency->is_base) {
            $conversionRate = $account->currency->currentRate();
            $convertedAmount = $item['amount'] * $conversionRate;
        }

        if ($type === TransactionType::TRANSFER_IN) {
            $fromAccount = Account::where('name', $item['from_account'])->first();
            $destinationAccount = $account;

            if (! $fromAccount) {
                throw new RuntimeException('From account not found: '.$item['from_account']);
            }
        }

        if ($type === TransactionType::TRANSFER_OUT) {
            $fromAccount = $account;
            $destinationAccount = Account::where('name', $item['to_account'])->first();

            if (! $destinationAccount) {
                throw new RuntimeException('Destination account not found: '.$item['to_account']);
            }
        }

        $account->transactions()->create([
            'type' => $type,
            'amount' => $item['amount'],
            'transaction_date' => $item['transaction_date'],
            'description' => $item['description'],
            'destination_account_id' => $destinationAccount?->id,
            'from_account_id' => $fromAccount?->id,
            'category_id' => Category::firstWhere('name', $item['category'])?->id,
            'conversion_rate' => $conversionRate,
            'converted_amount' => $convertedAmount,
            'running_balance' => $item['running_balance'],
            'created_at' => $item['created_at'],
            'updated_at' => $item['updated_at'],
        ]);

    }

    // private function importAccounts(): void
    // {
    //     $path = storage_path('app/accounts.json');

    //     if (! is_file($path)) {
    //         $this->error(sprintf('File not found: %s', $path));

    //         return;
    //     }

    //     $json = file_get_contents($path);
    //     $data = json_decode($json, true);

    //     if (! is_array($data)) {
    //         $this->error('Invalid JSON structure');

    //         return;
    //     }

    //     foreach ($data as $item) {
    //         // Create or fetch the account
    //         Account::firstOrCreate([
    //             'user_id' => 1,
    //             'name' => $item['name'],
    //         ], [
    //             'currency_id' => Currency::where('code', $item['code'])->first()->id,
    //             'type' => $this->getType($item['type']),
    //             'balance' => $item['current_balance'],
    //             'emoji' => $this->getEmoji($item['type']),
    //             'color' => '#f59e0b',
    //         ]);
    //     }

    //     $this->info('Accounts imported successfully.');
    // }

    // private function getType(string $type): string
    // {
    //     return match (mb_strtolower($type)) {
    //         'credit' => 'credit_card',
    //         'cash' => 'cash',
    //         'cxc' => 'cxc',
    //         'debit' => 'debit_card',
    //         default => 'other',
    //     };
    // }

    // private function getEmoji(string $type): string
    // {
    //     return match (mb_strtolower($type)) {
    //         'credit' => '💳',
    //         'cash' => '💵',
    //         'cxc' => '📥',
    //         'debit' => '🏧',
    //         default => '🏦',
    //     };
    // }

    private function importBudgets(): void
    {
        //  $path = storage_path('app/budgets.json');

        // if (! is_file($path)) {
        //     $this->error(sprintf('File not found: %s', $path));

        //     return;
        // }

        // $json = file_get_contents($path);
        // $data = json_decode($json, true);

        // if (! is_array($data)) {
        //     $this->error('Invalid JSON structure');

        //     return;
        // }

        // // --- Group by "name"
        // $grouped = collect($data)->groupBy('name');

        // foreach ($grouped as $name => $items) {
        //     $this->info("Processing budget: {$name}");

        //     // Extract first record to reuse shared info like dates
        //     $first = $items->first();
        //     $start = $first['start_date'];
        //     $end = $first['end_date'];

        //     // Create or fetch the budget
        //     $budget = BudgetPeriod::firstOrCreate([
        //         'user_id' => 1,
        //         'name' => $name,
        //     ], [
        //         'type' => 'monthly',
        //         'start_date' => $start,
        //         'end_date' => $end,
        //     ]);

        //     foreach ($items as $item) {
        //         // Create or fetch category
        //         $category = Category::firstOrCreate(['name' => $item['category']]);

        //         // Create detail
        //         Budget::updateOrCreate([
        //             'user_id' => 1,
        //             'budget_period_id' => $budget->id,
        //             'category_id' => $category->id,
        //         ], [
        //             'amount' => $item['amount'],
        //             'type' => 'period',
        //             'name' => $category->name.' - '.$budget->name,
        //             'is_active' => true,
        //         ]);
        //     }
        // }

        // $this->info('Budgets imported successfully.');
    }
}
