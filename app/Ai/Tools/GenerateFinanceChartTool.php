<?php

declare(strict_types=1);

namespace App\Ai\Tools;

use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

final class GenerateFinanceChartTool implements Tool
{
    public function __construct(private User $user) {}

    public function description(): Stringable|string
    {
        return 'Genera datos estructurados para graficos financieros (gasto por categoria, evolucion mensual e ingresos vs gastos).';
    }

    public function handle(Request $request): Stringable|string
    {
        $chartType = $this->toString($request['chart_type'] ?? null);

        Log::debug('finance-chart tool request', [
            'user_id' => $this->user->id,
            'chart_type' => $chartType,
            'period' => $this->toString($request['period'] ?? null),
            'date_from' => $this->toString($request['date_from'] ?? null),
            'date_to' => $this->toString($request['date_to'] ?? null),
            'account_id' => $this->toInt($request['account_id'] ?? null),
            'account_name' => $this->toString($request['account_name'] ?? null),
            'category_id' => $this->toInt($request['category_id'] ?? null),
            'category_name' => $this->toString($request['category_name'] ?? null),
        ]);

        if (! in_array($chartType, ['spending_by_category', 'category_trend', 'income_vs_expense'], true)) {
            return 'chart_type invalido. Usa spending_by_category, category_trend o income_vs_expense.';
        }

        $period = $this->resolvePeriod(
            period: $this->toString($request['period'] ?? null),
            dateFrom: $request['date_from'] ?? null,
            dateTo: $request['date_to'] ?? null,
        );

        if (isset($period['error'])) {
            return (string) $period['error'];
        }

        $accountId = $this->toInt($request['account_id'] ?? null);
        $accountName = $this->toString($request['account_name'] ?? null);
        $account = null;

        if ($accountId !== null || $accountName !== null) {
            $account = $this->resolveAccount($accountId, $accountName);

            if (! $account) {
                return 'No se pudo resolver la cuenta. Proporciona una cuenta valida o consulta global.';
            }
        }

        $result = match ($chartType) {
            'spending_by_category' => $this->buildSpendingByCategoryChart(
                start: $period['start'],
                end: $period['end'],
                periodLabel: $period['label'],
                account: $account,
                topCategories: $this->resolveTopCategories($request['top_categories'] ?? null),
            ),
            'category_trend' => $this->buildCategoryTrendChart(
                start: $period['start'],
                end: $period['end'],
                periodLabel: $period['label'],
                account: $account,
                category: $this->resolveCategory(
                    id: $this->toInt($request['category_id'] ?? null),
                    name: $this->toString($request['category_name'] ?? null),
                ),
            ),
            'income_vs_expense' => $this->buildIncomeVsExpenseChart(
                start: $period['start'],
                end: $period['end'],
                periodLabel: $period['label'],
                account: $account,
            ),
        };

        $decodedResult = json_decode($result, true);

        Log::debug('finance-chart tool response', [
            'user_id' => $this->user->id,
            'chart_type' => $chartType,
            'is_chart_payload' => is_array($decodedResult),
            'kind' => is_array($decodedResult) ? ($decodedResult['kind'] ?? null) : null,
            'points_count' => is_array($decodedResult) && isset($decodedResult['points']) && is_array($decodedResult['points'])
                ? count($decodedResult['points'])
                : null,
            'response_preview' => mb_substr($result, 0, 220),
        ]);

        return $result;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'chart_type' => $schema->string()
                ->description('Tipo de grafico a generar.')
                ->enum(['spending_by_category', 'category_trend', 'income_vs_expense'])
                ->required(),
            'period' => $schema->string()
                ->description('Periodo para el grafico. Por defecto usa last_30_days.')
                ->enum(['last_7_days', 'last_30_days', 'this_month', 'last_month', 'this_year', 'last_year', 'custom']),
            'date_from' => $schema->string()
                ->description('Fecha inicial YYYY-MM-DD para period=custom.'),
            'date_to' => $schema->string()
                ->description('Fecha final YYYY-MM-DD para period=custom.'),
            'account_id' => $schema->integer()
                ->description('ID de cuenta opcional para filtrar el grafico.'),
            'account_name' => $schema->string()
                ->description('Nombre exacto de cuenta opcional si no se envia account_id.'),
            'category_id' => $schema->integer()
                ->description('ID de categoria para category_trend.'),
            'category_name' => $schema->string()
                ->description('Nombre exacto o parcial de categoria para category_trend.'),
            'top_categories' => $schema->integer()
                ->description('Cantidad de categorias en spending_by_category. Minimo 3, maximo 20. Por defecto 10.'),
        ];
    }

    private function buildSpendingByCategoryChart(
        CarbonImmutable $start,
        CarbonImmutable $end,
        string $periodLabel,
        ?Account $account,
        int $topCategories,
    ): string {
        $transactions = Transaction::query()
            ->where('type', TransactionType::EXPENSE)
            ->whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->whereHas('account', fn ($query) => $query->where('user_id', $this->user->id))
            ->with(['account.currency', 'category'])
            ->when($account !== null, fn ($query) => $query->where('account_id', $account->id))
            ->get();

        if ($transactions->isEmpty()) {
            return 'No hay gastos en el periodo solicitado para generar el grafico.';
        }

        $totals = [];

        foreach ($transactions as $transaction) {
            $categoryName = $transaction->category?->name ?? 'Sin categoria';
            $totals[$categoryName] = ($totals[$categoryName] ?? 0.0) + $this->toBaseAmount($transaction);
        }

        arsort($totals);
        $totals = array_slice($totals, 0, $topCategories, true);

        $points = [];
        $table = [];

        foreach ($totals as $categoryName => $amount) {
            $normalizedAmount = round((float) $amount, 2);

            $points[] = [
                'label' => $categoryName,
                'amount' => $normalizedAmount,
            ];

            $table[] = [
                'categoria' => $categoryName,
                'monto' => $normalizedAmount,
            ];
        }

        $payload = [
            'version' => 1,
            'kind' => 'bar',
            'title' => 'Gasto por categoria',
            'subtitle' => $this->buildSubtitle($periodLabel, $start, $end, $account),
            'xAxis' => [
                'key' => 'label',
                'label' => 'Categoria',
            ],
            'series' => [
                [
                    'key' => 'amount',
                    'label' => 'Monto',
                    'color' => '#2563eb',
                ],
            ],
            'points' => $points,
            'table' => $table,
            'csv' => $this->toCsv(
                ['categoria', 'monto'],
                $table,
            ),
        ];

        return $this->encodePayload($payload);
    }

    private function buildCategoryTrendChart(
        CarbonImmutable $start,
        CarbonImmutable $end,
        string $periodLabel,
        ?Account $account,
        ?Category $category,
    ): string {
        if (! $category) {
            return 'No se pudo resolver la categoria para category_trend.';
        }

        $transactionType = $category->type === CategoryType::INCOME
            ? TransactionType::INCOME
            : TransactionType::EXPENSE;

        $transactions = Transaction::query()
            ->where('type', $transactionType)
            ->where('category_id', $category->id)
            ->whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->whereHas('account', fn ($query) => $query->where('user_id', $this->user->id))
            ->with(['account.currency'])
            ->when($account !== null, fn ($query) => $query->where('account_id', $account->id))
            ->get();

        $monthBuckets = $this->monthBuckets($start, $end);

        foreach ($transactions as $transaction) {
            $bucket = $transaction->transaction_date->format('Y-m');

            if (! array_key_exists($bucket, $monthBuckets)) {
                continue;
            }

            $monthBuckets[$bucket] += $this->toBaseAmount($transaction);
        }

        $points = [];
        $table = [];

        foreach ($monthBuckets as $monthKey => $amount) {
            $normalizedAmount = round($amount, 2);

            $points[] = [
                'label' => $monthKey,
                'amount' => $normalizedAmount,
            ];

            $table[] = [
                'mes' => $monthKey,
                'monto' => $normalizedAmount,
            ];
        }

        $payload = [
            'version' => 1,
            'kind' => 'line',
            'title' => sprintf('Evolucion mensual: %s', $category->name),
            'subtitle' => $this->buildSubtitle($periodLabel, $start, $end, $account),
            'xAxis' => [
                'key' => 'label',
                'label' => 'Mes',
            ],
            'series' => [
                [
                    'key' => 'amount',
                    'label' => 'Monto',
                    'color' => '#0d9488',
                ],
            ],
            'points' => $points,
            'table' => $table,
            'csv' => $this->toCsv(
                ['mes', 'monto'],
                $table,
            ),
        ];

        return $this->encodePayload($payload);
    }

    private function buildIncomeVsExpenseChart(
        CarbonImmutable $start,
        CarbonImmutable $end,
        string $periodLabel,
        ?Account $account,
    ): string {
        $transactions = Transaction::query()
            ->whereIn('type', [TransactionType::INCOME, TransactionType::EXPENSE])
            ->whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->whereHas('account', fn ($query) => $query->where('user_id', $this->user->id))
            ->with(['account.currency'])
            ->when($account !== null, fn ($query) => $query->where('account_id', $account->id))
            ->get();

        if ($transactions->isEmpty()) {
            return 'No hay ingresos ni gastos en el periodo solicitado para generar el grafico.';
        }

        $monthBuckets = $this->monthBuckets($start, $end, ['income' => 0.0, 'expense' => 0.0]);

        foreach ($transactions as $transaction) {
            $bucket = $transaction->transaction_date->format('Y-m');

            if (! array_key_exists($bucket, $monthBuckets)) {
                continue;
            }

            $amount = $this->toBaseAmount($transaction);

            if ($transaction->type === TransactionType::INCOME) {
                $monthBuckets[$bucket]['income'] += $amount;

                continue;
            }

            $monthBuckets[$bucket]['expense'] += $amount;
        }

        $points = [];
        $table = [];

        foreach ($monthBuckets as $monthKey => $values) {
            $income = round((float) ($values['income'] ?? 0.0), 2);
            $expense = round((float) ($values['expense'] ?? 0.0), 2);

            $points[] = [
                'label' => $monthKey,
                'income' => $income,
                'expense' => $expense,
            ];

            $table[] = [
                'mes' => $monthKey,
                'ingresos' => $income,
                'gastos' => $expense,
            ];
        }

        $payload = [
            'version' => 1,
            'kind' => 'stacked_bar',
            'title' => 'Ingresos vs gastos por mes',
            'subtitle' => $this->buildSubtitle($periodLabel, $start, $end, $account),
            'xAxis' => [
                'key' => 'label',
                'label' => 'Mes',
            ],
            'series' => [
                [
                    'key' => 'income',
                    'label' => 'Ingresos',
                    'color' => '#16a34a',
                ],
                [
                    'key' => 'expense',
                    'label' => 'Gastos',
                    'color' => '#dc2626',
                ],
            ],
            'points' => $points,
            'table' => $table,
            'csv' => $this->toCsv(
                ['mes', 'ingresos', 'gastos'],
                $table,
            ),
        ];

        return $this->encodePayload($payload);
    }

    /**
     * @return array{start: CarbonImmutable, end: CarbonImmutable, label: string}|array{error: string}
     */
    private function resolvePeriod(?string $period, mixed $dateFrom, mixed $dateTo): array
    {
        $label = $period ?? 'last_30_days';
        $today = CarbonImmutable::today();

        return match ($label) {
            'last_7_days' => [
                'start' => $today->subDays(6),
                'end' => $today,
                'label' => $label,
            ],
            'last_30_days' => [
                'start' => $today->subDays(29),
                'end' => $today,
                'label' => $label,
            ],
            'this_month' => [
                'start' => $today->startOfMonth(),
                'end' => $today,
                'label' => $label,
            ],
            'last_month' => [
                'start' => $today->subMonthNoOverflow()->startOfMonth(),
                'end' => $today->subMonthNoOverflow()->endOfMonth(),
                'label' => $label,
            ],
            'this_year' => [
                'start' => $today->startOfYear(),
                'end' => $today,
                'label' => $label,
            ],
            'last_year' => [
                'start' => $today->subYear()->startOfYear(),
                'end' => $today->subYear()->endOfYear(),
                'label' => $label,
            ],
            'custom' => $this->resolveCustomPeriod($dateFrom, $dateTo),
            default => ['error' => 'period invalido. Usa last_7_days, last_30_days, this_month, last_month, this_year, last_year o custom.'],
        };
    }

    /**
     * @return array{start: CarbonImmutable, end: CarbonImmutable, label: string}|array{error: string}
     */
    private function resolveCustomPeriod(mixed $dateFrom, mixed $dateTo): array
    {
        $from = $this->parseDate($dateFrom);
        $to = $this->parseDate($dateTo);

        if (! $from || ! $to) {
            return ['error' => 'Para period=custom debes enviar date_from y date_to con formato YYYY-MM-DD.'];
        }

        if ($from->greaterThan($to)) {
            return ['error' => 'date_from no puede ser mayor que date_to.'];
        }

        return [
            'start' => $from,
            'end' => $to,
            'label' => 'custom',
        ];
    }

    private function parseDate(mixed $value): ?CarbonImmutable
    {
        if ($value === null || $this->strip((string) $value) === '') {
            return null;
        }

        $date = (string) $value;

        try {
            $parsed = CarbonImmutable::createFromFormat('Y-m-d', $date);
        } catch (Throwable) {
            return null;
        }

        if (! $parsed || $parsed->format('Y-m-d') !== $date) {
            return null;
        }

        return $parsed;
    }

    private function resolveAccount(?int $id, ?string $name): ?Account
    {
        if ($id !== null) {
            $account = Account::query()
                ->where('user_id', $this->user->id)
                ->where('id', $id)
                ->first();

            if ($account) {
                return $account;
            }
        }

        if ($name === null) {
            return null;
        }

        return Account::query()
            ->where('user_id', $this->user->id)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();
    }

    private function resolveCategory(?int $id, ?string $name): ?Category
    {
        if ($id !== null) {
            $category = Category::query()
                ->where('user_id', $this->user->id)
                ->where('id', $id)
                ->first();

            if ($category) {
                return $category;
            }
        }

        if ($name === null) {
            return null;
        }

        $exactMatch = Category::query()
            ->where('user_id', $this->user->id)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        if ($exactMatch) {
            return $exactMatch;
        }

        return Category::query()
            ->where('user_id', $this->user->id)
            ->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($name).'%'])
            ->orderBy('name')
            ->first();
    }

    private function toBaseAmount(Transaction $transaction): float
    {
        if ($transaction->converted_amount !== null) {
            return (float) $transaction->converted_amount;
        }

        if ($transaction->conversion_rate !== null && $transaction->conversion_rate > 0) {
            return (float) $transaction->amount * (float) $transaction->conversion_rate;
        }

        return (float) $transaction->amount;
    }

    /**
     * @template TDefault
     *
     * @param  TDefault  $default
     * @return array<string, float>|array<string, array{income: float, expense: float}>
     */
    private function monthBuckets(CarbonImmutable $start, CarbonImmutable $end, mixed $default = 0.0): array
    {
        $buckets = [];
        $cursor = $start->startOfMonth();
        $endMonth = $end->startOfMonth();

        while ($cursor->lessThanOrEqualTo($endMonth)) {
            $key = $cursor->format('Y-m');

            $buckets[$key] = is_array($default) ? [
                'income' => (float) ($default['income'] ?? 0.0),
                'expense' => (float) ($default['expense'] ?? 0.0),
            ] : (float) $default;

            $cursor = $cursor->addMonth();
        }

        return $buckets;
    }

    private function buildSubtitle(string $periodLabel, CarbonImmutable $start, CarbonImmutable $end, ?Account $account): string
    {
        $scope = $account ? sprintf('cuenta %s', $account->name) : 'todas las cuentas';

        return sprintf(
            '%s | %s a %s | %s',
            $periodLabel,
            $start->format('Y-m-d'),
            $end->format('Y-m-d'),
            $scope,
        );
    }

    /**
     * @param  array<int, string>  $headers
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function toCsv(array $headers, array $rows): string
    {
        $lines = [implode(',', $headers)];

        foreach ($rows as $row) {
            $lineValues = [];

            foreach ($headers as $header) {
                $value = $row[$header] ?? '';
                $raw = (string) $value;
                $escaped = str_replace('"', '""', $raw);
                $lineValues[] = '"'.$escaped.'"';
            }

            $lines[] = implode(',', $lineValues);
        }

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function encodePayload(array $payload): string
    {
        $encoded = json_encode($payload, JSON_UNESCAPED_SLASHES);

        if ($encoded === false) {
            return 'No se pudo serializar el resultado del grafico.';
        }

        return $encoded;
    }

    private function resolveTopCategories(mixed $value): int
    {
        if ($value === null || $value === '' || ! is_numeric($value)) {
            return 10;
        }

        $count = (int) $value;

        if ($count < 3) {
            return 3;
        }

        if ($count > 20) {
            return 20;
        }

        return $count;
    }

    private function toInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (! is_numeric($value)) {
            return null;
        }

        return (int) $value;
    }

    private function toString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $string = $this->strip((string) $value);

        return $string === '' ? null : $string;
    }

    private function strip(string $value): string
    {
        return preg_replace('/^\s+|\s+$/u', '', $value) ?? $value;
    }
}
