<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Receivable;
use App\Models\ReceivableSeries;
use Carbon\Carbon;
use Illuminate\Console\Command;

final class GenerateReceivableOccurrencesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'receivables:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate recurring receivable occurrences.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = now()->startOfDay();

        $seriesList = ReceivableSeries::query()
            ->where('is_recurring', true)
            ->whereNotNull('next_due_date')
            ->whereDate('next_due_date', '<=', $today)
            ->get();

        foreach ($seriesList as $series) {
            if (! is_array($series->recurrence_rule)) {
                continue;
            }

            $nextDueDate = Carbon::parse($series->next_due_date);

            while ($nextDueDate->lte($today)) {
                Receivable::query()->create([
                    'user_id' => $series->user_id,
                    'contact_id' => $series->contact_id,
                    'currency_id' => $series->currency_id,
                    'receivable_series_id' => $series->id,
                    'amount_total' => $series->default_amount,
                    'amount_paid' => 0,
                    'status' => 'open',
                    'description' => $series->name,
                    'due_date' => $nextDueDate->toDateString(),
                    'origin_transaction_id' => null,
                ]);

                $nextDueDate = $this->calculateNextDueDate($nextDueDate, $series->recurrence_rule);
            }

            $series->update(['next_due_date' => $nextDueDate->toDateString()]);
        }

        return self::SUCCESS;
    }

    /**
     * @param  array<string, mixed>  $rule
     */
    private function calculateNextDueDate(Carbon $current, array $rule): Carbon
    {
        $dayOfMonth = (int) ($rule['day_of_month'] ?? $current->day);

        return $current->copy()->addMonthNoOverflow()->day($dayOfMonth);
    }
}
