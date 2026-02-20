<?php

declare(strict_types=1);

namespace App\Ai\Tools;

use App\Actions\CreateTransactionAction;
use App\Dto\CreateTransactionDto;
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

final class CreateFinanceTransactionTool implements Tool
{
    public function __construct(private User $user) {}

    public function description(): Stringable|string
    {
        return 'Crea una transaccion de ingreso, gasto o transferencia para el usuario.';
    }

    public function handle(Request $request): Stringable|string
    {
        $transactionType = TransactionType::tryFrom((string) ($request['type'] ?? ''));

        if (! $transactionType || ! $transactionType->isCreatable()) {
            return 'Tipo de transaccion invalido. Usa income, expense o transfer.';
        }

        $amount = $this->toFloat($request['amount'] ?? null);

        if ($amount === null || $amount <= 0) {
            return 'El monto debe ser un numero mayor que cero.';
        }

        $transactionDate = $this->resolveDate($request['transaction_date'] ?? null);

        if ($transactionDate === null) {
            return 'transaction_date debe usar el formato YYYY-MM-DD.';
        }

        $account = $this->resolveAccount(
            id: $this->toInt($request['account_id'] ?? null),
            name: $this->toString($request['account_name'] ?? null),
        );

        if (! $account) {
            return 'No se pudo resolver la cuenta origen. Proporciona account_id o account_name desde la herramienta de cuentas.';
        }

        $expectedCategoryType = $transactionType === TransactionType::INCOME
            ? CategoryType::INCOME
            : CategoryType::EXPENSE;

        $rawSplits = $request['splits'] ?? null;
        $hasSplits = is_array($rawSplits) && count($rawSplits) > 0;
        $splits = [];

        if ($transactionType === TransactionType::TRANSFER) {
            if ($hasSplits) {
                return 'Las transferencias no permiten dividir el monto en categorias.';
            }

            if ($this->toInt($request['category_id'] ?? null) !== null || $this->toString($request['category_name'] ?? null) !== null) {
                return 'Las transferencias no requieren categoria.';
            }
        }

        if ($hasSplits) {
            if ($this->toInt($request['category_id'] ?? null) !== null || $this->toString($request['category_name'] ?? null) !== null) {
                return 'No puedes enviar categoria principal cuando ya hay divisiones.';
            }

            $resolved = $this->resolveSplits($rawSplits, $expectedCategoryType, $amount);

            if (isset($resolved['error'])) {
                return (string) $resolved['error'];
            }

            $splits = $resolved['splits'];
        }

        $category = null;

        if ($transactionType !== TransactionType::TRANSFER && ! $hasSplits) {
            $category = $this->resolveCategory(
                id: $this->toInt($request['category_id'] ?? null),
                name: $this->toString($request['category_name'] ?? null),
            );

            if (! $category) {
                return 'No se pudo resolver la categoria. Proporciona category_id o category_name desde la herramienta de categorias.';
            }

            if ($category->type !== $expectedCategoryType) {
                return sprintf(
                    'La categoria no coincide. Las transacciones %s requieren una categoria %s.',
                    $transactionType->value,
                    $expectedCategoryType->value,
                );
            }
        }

        $destinationAccount = null;

        if ($transactionType === TransactionType::TRANSFER) {
            $destinationAccount = $this->resolveAccount(
                id: $this->toInt($request['destination_account_id'] ?? null),
                name: $this->toString($request['destination_account_name'] ?? null),
            );

            if (! $destinationAccount) {
                return 'No se pudo resolver la cuenta destino. Proporciona destination_account_id o destination_account_name.';
            }

            if ($destinationAccount->is($account)) {
                return 'La cuenta origen y destino deben ser diferentes.';
            }
        }

        $description = $this->toString($request['description'] ?? null);

        if ($description !== null) {
            $description = mb_substr($description, 0, 255);
        }

        $confirmDuplicate = $this->toBool($request['confirm_duplicate'] ?? false);

        if ($transactionType === TransactionType::EXPENSE && ! $confirmDuplicate) {
            $potentialDuplicate = $this->findPotentialDuplicateExpense(
                account: $account,
                amount: $amount,
                transactionDate: $transactionDate,
                category: $hasSplits ? null : $category,
                description: $description,
            );

            if ($potentialDuplicate) {
                return $this->buildPotentialDuplicateMessage($potentialDuplicate);
            }
        }

        $dto = new CreateTransactionDto(
            type: $transactionType,
            amount: $amount,
            personal_amount: null,
            transaction_date: $transactionDate,
            description: $description,
            destination_account: $destinationAccount,
            category: $category,
            conversion_rate: 1.0,
            received_amount: null,
            ai_assisted: true,
            splits: $splits,
            is_shared: false,
            shared_receivables: [],
        );

        try {
            app(CreateTransactionAction::class)->handle($account, $dto);
        } catch (Throwable $exception) {
            return sprintf('No se pudo crear la transaccion: %s', $exception->getMessage());
        }

        $account->refresh()->loadMissing('currency');

        $message = sprintf(
            'Transaccion creada: tipo=%s monto=%.2f cuenta="%s" fecha=%s. Nuevo saldo=%.2f %s.',
            $transactionType->value,
            $amount,
            $account->name,
            $transactionDate,
            $account->balance,
            $account->currency->code,
        );

        if ($destinationAccount) {
            $destinationAccount->refresh()->loadMissing('currency');

            $message .= sprintf(
                ' Destino "%s" saldo=%.2f %s.',
                $destinationAccount->name,
                $destinationAccount->balance,
                $destinationAccount->currency->code,
            );
        }

        return $message;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $schema->string()
                ->description('Tipo de transaccion.')
                ->enum([
                    TransactionType::INCOME->value,
                    TransactionType::EXPENSE->value,
                    TransactionType::TRANSFER->value,
                ])
                ->required(),
            'amount' => $schema->number()
                ->description('Monto de la transaccion mayor que cero.')
                ->required(),
            'transaction_date' => $schema->string()
                ->description('Fecha opcional en formato YYYY-MM-DD. Si se omite, usa la fecha de hoy.'),
            'description' => $schema->string()
                ->description('Descripcion opcional legible de la transaccion.'),
            'account_id' => $schema->integer()
                ->description('ID de la cuenta origen.'),
            'account_name' => $schema->string()
                ->description('Nombre exacto de la cuenta origen si no se envia account_id.'),
            'category_id' => $schema->integer()
                ->description('ID de categoria. Obligatorio para income y expense.'),
            'category_name' => $schema->string()
                ->description('Nombre exacto de categoria. Obligatorio para income y expense cuando falta category_id.'),
            'destination_account_id' => $schema->integer()
                ->description('ID de cuenta destino. Obligatorio para transferencias.'),
            'destination_account_name' => $schema->string()
                ->description('Nombre exacto de cuenta destino si no se envia destination_account_id.'),
            'confirm_duplicate' => $schema->boolean()
                ->description('Define true para crear el gasto aunque se detecte posible duplicado.'),
            'splits' => $schema->array()
                ->description('Lista de divisiones por categoria. Solo para income o expense.')
                ->items($schema->object([
                    'category_id' => $schema->integer()
                        ->description('ID de categoria para la division.'),
                    'category_name' => $schema->string()
                        ->description('Nombre de categoria para la division si falta category_id.'),
                    'amount' => $schema->number()
                        ->description('Monto asignado a esta categoria.')
                        ->required(),
                ])),
        ];
    }

    /**
     * @param  array<int, mixed>  $rawSplits
     * @return array{splits: array<int, array{category_id: int, amount: float}>}|array{error: string}
     */
    private function resolveSplits(array $rawSplits, CategoryType $expectedCategoryType, float $amount): array
    {
        if ($rawSplits === []) {
            return ['error' => 'Agrega al menos una division.'];
        }

        $splits = [];
        $categoryIds = [];
        $total = 0.0;

        foreach ($rawSplits as $index => $rawSplit) {
            if (! is_array($rawSplit)) {
                return ['error' => sprintf('La division %d no es valida.', $index + 1)];
            }

            $splitAmount = $this->toFloat($rawSplit['amount'] ?? null);

            if ($splitAmount === null || $splitAmount <= 0) {
                return ['error' => sprintf('El monto de la division %d debe ser mayor que cero.', $index + 1)];
            }

            $category = $this->resolveCategory(
                id: $this->toInt($rawSplit['category_id'] ?? null),
                name: $this->toString($rawSplit['category_name'] ?? null),
            );

            if (! $category) {
                return ['error' => sprintf('No se pudo resolver la categoria en la division %d.', $index + 1)];
            }

            if ($category->type !== $expectedCategoryType) {
                return ['error' => 'Todas las divisiones deben usar categorias del mismo tipo.'];
            }

            if (in_array($category->id, $categoryIds, true)) {
                return ['error' => 'No puedes repetir categorias en las divisiones.'];
            }

            $categoryIds[] = $category->id;
            $splits[] = [
                'category_id' => $category->id,
                'amount' => $splitAmount,
            ];
            $total += $splitAmount;
        }

        if (abs($total - $amount) > 0.01) {
            return ['error' => 'La suma de las divisiones debe ser igual al monto total.'];
        }

        return ['splits' => $splits];
    }

    private function findPotentialDuplicateExpense(
        Account $account,
        float $amount,
        string $transactionDate,
        ?Category $category,
        ?string $description,
    ): ?Transaction {
        $transactionDateCarbon = CarbonImmutable::createFromFormat('Y-m-d', $transactionDate);

        if (! $transactionDateCarbon) {
            return null;
        }

        $candidates = Transaction::query()
            ->where('account_id', $account->id)
            ->where('type', TransactionType::EXPENSE)
            ->where('amount', $amount)
            ->whereBetween('transaction_date', [
                $transactionDateCarbon->subDays(2)->format('Y-m-d'),
                $transactionDateCarbon->addDays(2)->format('Y-m-d'),
            ])
            ->when($category !== null, fn ($query) => $query->where('category_id', $category->id))
            ->with(['account.currency', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        foreach ($candidates as $candidate) {
            if (! $this->isPotentialDuplicateMatch($candidate, $transactionDate, $description)) {
                continue;
            }

            return $candidate;
        }

        return null;
    }

    private function isPotentialDuplicateMatch(Transaction $candidate, string $transactionDate, ?string $description): bool
    {
        if ($candidate->transaction_date->format('Y-m-d') === $transactionDate) {
            return true;
        }

        if ($description === null || $candidate->description === null) {
            return false;
        }

        return $this->descriptionsLookSimilar($description, $candidate->description);
    }

    private function descriptionsLookSimilar(string $descriptionA, string $descriptionB): bool
    {
        $normalizedA = $this->normalizeDescription($descriptionA);
        $normalizedB = $this->normalizeDescription($descriptionB);

        if ($normalizedA === '' || $normalizedB === '') {
            return false;
        }

        if ($normalizedA === $normalizedB) {
            return true;
        }

        if (str_contains($normalizedA, $normalizedB) || str_contains($normalizedB, $normalizedA)) {
            return true;
        }

        similar_text($normalizedA, $normalizedB, $percentage);

        return $percentage >= 80.0;
    }

    private function normalizeDescription(string $description): string
    {
        $withoutSymbols = preg_replace('/[^\pL\pN\s]/u', ' ', $description) ?? $description;
        $collapsed = preg_replace('/\s+/u', ' ', $withoutSymbols) ?? $withoutSymbols;

        return mb_strtolower($this->strip($collapsed));
    }

    private function buildPotentialDuplicateMessage(Transaction $transaction): string
    {
        $currencyCode = $transaction->account->currency->code ?? 'N/A';
        $categoryName = $transaction->category?->name ?? 'Sin categoria';
        $description = $this->toString($transaction->description);

        $message = sprintf(
            'Posible gasto duplicado detectado: cuenta="%s", monto=%.2f %s, fecha=%s, categoria="%s".',
            $transaction->account->name,
            $transaction->amount,
            $currencyCode,
            $transaction->transaction_date->format('Y-m-d'),
            $categoryName,
        );

        if ($description !== null) {
            $message .= sprintf(' Descripcion similar: "%s".', mb_substr($description, 0, 120));
        }

        $message .= ' Confirma con confirm_duplicate=true si deseas registrarlo de todos modos.';

        return $message;
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

        return Category::query()
            ->where('user_id', $this->user->id)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();
    }

    private function resolveDate(mixed $value): ?string
    {
        if ($value === null || $this->strip((string) $value) === '') {
            return now()->toDateString();
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

        return $date;
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

    private function toFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (! is_numeric($value)) {
            return null;
        }

        return (float) $value;
    }

    private function toBool(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_string($value)) {
            $normalized = mb_strtolower($this->strip($value));

            return in_array($normalized, ['1', 'true', 'yes', 'si', 'sí'], true);
        }

        if (is_int($value) || is_float($value)) {
            return (float) $value === 1.0;
        }

        return false;
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
