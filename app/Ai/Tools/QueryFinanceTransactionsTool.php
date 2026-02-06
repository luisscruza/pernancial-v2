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
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

final class QueryFinanceTransactionsTool implements Tool
{
    public function __construct(private User $user) {}

    public function description(): Stringable|string
    {
        return 'Consulta transacciones recientes por cuenta o globales y resume gasto por categoria en periodos.';
    }

    public function handle(Request $request): Stringable|string
    {
        $queryType = mb_strtolower($this->strip((string) ($request['query_type'] ?? '')));

        return match ($queryType) {
            'recent_transactions' => $this->handleRecentTransactions($request),
            'category_spending' => $this->handleCategorySpending($request),
            default => 'query_type invalido. Usa recent_transactions o category_spending.',
        };
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'query_type' => $schema->string()
                ->description('Tipo de consulta a ejecutar.')
                ->enum(['recent_transactions', 'category_spending'])
                ->required(),
            'account_id' => $schema->integer()
                ->description('ID de la cuenta. Opcional para recent_transactions y category_spending.'),
            'account_name' => $schema->string()
                ->description('Nombre exacto de la cuenta si no se envia account_id. Opcional.'),
            'category_id' => $schema->integer()
                ->description('ID de la categoria. Obligatorio para category_spending.'),
            'category_name' => $schema->string()
                ->description('Nombre exacto de la categoria si no se envia category_id.'),
            'period' => $schema->string()
                ->description('Periodo para category_spending. Por defecto usa last_month.')
                ->enum(['last_7_days', 'last_30_days', 'this_month', 'last_month', 'this_year', 'last_year', 'custom']),
            'date_from' => $schema->string()
                ->description('Fecha inicial YYYY-MM-DD para periodo custom.'),
            'date_to' => $schema->string()
                ->description('Fecha final YYYY-MM-DD para periodo custom.'),
            'limit' => $schema->integer()
                ->description('Cantidad de transacciones en recent_transactions. Minimo 1, maximo 50. Por defecto 10.'),
            'include_transfers' => $schema->boolean()
                ->description('Si es false, excluye transferencias en recent_transactions. Por defecto true.'),
        ];
    }

    private function handleRecentTransactions(Request $request): string
    {
        $accountId = $this->toInt($request['account_id'] ?? null);
        $accountName = $this->toString($request['account_name'] ?? null);

        $account = null;

        if ($accountId !== null || $accountName !== null) {
            $account = $this->resolveAccount(
                id: $accountId,
                name: $accountName,
            );

            if (! $account) {
                return 'No se pudo resolver la cuenta. Proporciona un nombre de cuenta valido o consulta sin cuenta para incluir todas.';
            }
        }

        $limit = $this->resolveLimit($request['limit'] ?? null);
        $includeTransfers = (bool) ($request['include_transfers'] ?? true);

        $transactions = Transaction::query()
            ->whereHas('account', fn ($query) => $query->where('user_id', $this->user->id))
            ->with(['category', 'account.currency', 'destinationAccount', 'fromAccount'])
            ->when($account !== null, fn ($query) => $query->where('account_id', $account->id))
            ->when(! $includeTransfers, function ($query): void {
                $query->whereNotIn('type', [
                    TransactionType::TRANSFER->value,
                    TransactionType::TRANSFER_IN->value,
                    TransactionType::TRANSFER_OUT->value,
                ]);
            })
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        if ($transactions->isEmpty()) {
            if ($account) {
                return sprintf(
                    'No se encontraron transacciones recientes para la cuenta "%s" (id=%d).',
                    $account->name,
                    $account->id,
                );
            }

            return sprintf(
                'No se encontraron transacciones recientes para las cuentas del usuario (id=%d).',
                $this->user->id,
            );
        }

        $lines = [];

        if ($account) {
            $lines[] = sprintf(
                'Transacciones recientes de la cuenta "%s" (id=%d):',
                $account->name,
                $account->id,
            );
        } else {
            $lines[] = sprintf(
                'Transacciones recientes de todas las cuentas del usuario (id=%d):',
                $this->user->id,
            );
        }

        foreach ($transactions as $transaction) {
            $currencyCode = $transaction->account->currency->code ?? 'N/A';
            $transactionType = $transaction->type instanceof TransactionType
                ? $transaction->type->value
                : (string) $transaction->type;

            $line = sprintf(
                '- id=%d, fecha=%s, tipo=%s, monto=%.2f %s',
                $transaction->id,
                $transaction->transaction_date->format('Y-m-d'),
                $transactionType,
                $transaction->amount,
                $currencyCode,
            );

            $line .= sprintf(', cuenta="%s"', $transaction->account->name);

            if ($transaction->category) {
                $line .= sprintf(', categoria="%s"', $transaction->category->name);
            }

            if ($transactionType === TransactionType::TRANSFER_OUT->value && $transaction->destinationAccount) {
                $line .= sprintf(', cuenta_destino="%s"', $transaction->destinationAccount->name);
            }

            if ($transactionType === TransactionType::TRANSFER_IN->value && $transaction->fromAccount) {
                $line .= sprintf(', cuenta_origen="%s"', $transaction->fromAccount->name);
            }

            if ($transaction->description) {
                $line .= sprintf(', descripcion="%s"', $this->sanitizeText($transaction->description));
            }

            $lines[] = $line;
        }

        return implode("\n", $lines);
    }

    private function handleCategorySpending(Request $request): string
    {
        $category = $this->resolveCategory(
            id: $this->toInt($request['category_id'] ?? null),
            name: $this->toString($request['category_name'] ?? null),
        );

        if (! $category) {
            return 'No se pudo resolver la categoria. Proporciona category_id o category_name usando la herramienta de categorias.';
        }

        if ($category->type !== CategoryType::EXPENSE) {
            return sprintf(
                'La categoria "%s" no es de gasto. Usa una categoria de tipo expense.',
                $category->name,
            );
        }

        $accountId = $this->toInt($request['account_id'] ?? null);
        $accountName = $this->toString($request['account_name'] ?? null);
        $accountFilterNote = null;

        $account = $this->resolveAccount(
            id: $accountId,
            name: $accountName,
        );

        if ($accountId !== null || $accountName !== null) {
            if (! $account) {
                $accountFilterNote = 'No se pudo resolver la cuenta indicada. Se calculo el total global sin filtro por cuenta.';
            }
        }

        $period = $this->resolvePeriod(
            period: $this->toString($request['period'] ?? null),
            dateFrom: $request['date_from'] ?? null,
            dateTo: $request['date_to'] ?? null,
        );

        if (isset($period['error'])) {
            return (string) $period['error'];
        }

        $dateFrom = $period['start']->format('Y-m-d');
        $dateTo = $period['end']->format('Y-m-d');

        $transactions = Transaction::query()
            ->where('type', TransactionType::EXPENSE)
            ->where('category_id', $category->id)
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->whereHas('account', fn ($query) => $query->where('user_id', $this->user->id))
            ->with(['account.currency'])
            ->when($account !== null, fn ($query) => $query->where('account_id', $account->id))
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        if ($transactions->isEmpty()) {
            $lines = [];

            if ($accountFilterNote !== null) {
                $lines[] = $accountFilterNote;
            }

            if ($account) {
                $lines[] = sprintf(
                    'No se encontraron gastos en la categoria "%s" para la cuenta "%s" entre %s y %s.',
                    $category->name,
                    $account->name,
                    $dateFrom,
                    $dateTo,
                );

                return implode("\n", $lines);
            }

            $lines[] = sprintf(
                'No se encontraron gastos en la categoria "%s" entre %s y %s.',
                $category->name,
                $dateFrom,
                $dateTo,
            );

            return implode("\n", $lines);
        }

        $totalBase = $transactions->sum(fn (Transaction $transaction): float => $this->toBaseAmount($transaction));
        $baseCurrencyCode = $this->user->currency?->code ?? 'N/A';

        $currencyBreakdown = $transactions
            ->groupBy(fn (Transaction $transaction): string => $transaction->account->currency->code ?? 'N/A')
            ->map(function ($group): float {
                return (float) $group->sum('amount');
            })
            ->sortKeys()
            ->map(fn (float $amount, string $currencyCode): string => sprintf('%.2f %s', $amount, $currencyCode))
            ->implode(', ');

        $lines = [
            sprintf('Resumen de gasto en la categoria "%s" (id=%d):', $category->name, $category->id),
            sprintf('- periodo=%s, fecha_desde=%s, fecha_hasta=%s', $period['label'], $dateFrom, $dateTo),
            sprintf('- total_gastado_base=%.2f %s', $totalBase, $baseCurrencyCode),
            sprintf('- transacciones=%d', $transactions->count()),
            sprintf('- desglose_moneda_original=%s', $currencyBreakdown),
        ];

        if ($accountFilterNote !== null) {
            array_unshift($lines, $accountFilterNote);
        }

        if ($account) {
            $lines[] = sprintf('- cuenta_filtrada="%s" (id=%d)', $account->name, $account->id);
        }

        return implode("\n", $lines);
    }

    /**
     * @return array{start: CarbonImmutable, end: CarbonImmutable, label: string}|array{error: string}
     */
    private function resolvePeriod(?string $period, mixed $dateFrom, mixed $dateTo): array
    {
        $label = $period ?? 'last_month';
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

    private function resolveLimit(mixed $value): int
    {
        if ($value === null || $value === '' || ! is_numeric($value)) {
            return 10;
        }

        $limit = (int) $value;

        if ($limit < 1) {
            return 1;
        }

        if ($limit > 50) {
            return 50;
        }

        return $limit;
    }

    private function sanitizeText(string $value): string
    {
        $normalized = preg_replace('/\s+/u', ' ', $value) ?? $value;

        return mb_substr($this->strip($normalized), 0, 120);
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
