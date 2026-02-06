<?php

declare(strict_types=1);

namespace App\Ai\Tools;

use App\Actions\CreateTransactionAction;
use App\Dto\CreateTransactionDto;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
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
        return 'Create an income, expense, or transfer transaction for the user.';
    }

    public function handle(Request $request): Stringable|string
    {
        $transactionType = TransactionType::tryFrom((string) ($request['type'] ?? ''));

        if (! $transactionType || ! $transactionType->isCreatable()) {
            return 'Invalid transaction type. Use income, expense, or transfer.';
        }

        $amount = $this->toFloat($request['amount'] ?? null);

        if ($amount === null || $amount <= 0) {
            return 'Amount must be a number greater than zero.';
        }

        $transactionDate = $this->resolveDate($request['transaction_date'] ?? null);

        if ($transactionDate === null) {
            return 'transaction_date must use YYYY-MM-DD format.';
        }

        $account = $this->resolveAccount(
            id: $this->toInt($request['account_id'] ?? null),
            name: $this->toString($request['account_name'] ?? null),
        );

        if (! $account) {
            return 'Unable to resolve source account. Provide account_id or account_name from the accounts tool.';
        }

        $expectedCategoryType = $transactionType === TransactionType::INCOME
            ? CategoryType::INCOME
            : CategoryType::EXPENSE;

        $category = null;

        if ($transactionType !== TransactionType::TRANSFER) {
            $category = $this->resolveCategory(
                id: $this->toInt($request['category_id'] ?? null),
                name: $this->toString($request['category_name'] ?? null),
            );

            if (! $category) {
                return 'Unable to resolve category. Provide category_id or category_name from the categories tool.';
            }

            if ($category->type !== $expectedCategoryType) {
                return sprintf(
                    'Category type mismatch. %s transactions require a %s category.',
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
                return 'Unable to resolve destination account. Provide destination_account_id or destination_account_name.';
            }

            if ($destinationAccount->is($account)) {
                return 'Source and destination accounts must be different.';
            }
        }

        $description = $this->toString($request['description'] ?? null);

        if ($description !== null) {
            $description = mb_substr($description, 0, 255);
        }

        $dto = new CreateTransactionDto(
            type: $transactionType,
            amount: $amount,
            transaction_date: $transactionDate,
            description: $description,
            destination_account: $destinationAccount,
            category: $category,
            conversion_rate: 1.0,
            received_amount: null,
        );

        try {
            app(CreateTransactionAction::class)->handle($account, $dto);
        } catch (Throwable $exception) {
            return sprintf('Failed to create transaction: %s', $exception->getMessage());
        }

        $account->refresh()->loadMissing('currency');

        $message = sprintf(
            'Transaction created: type=%s amount=%.2f account="%s" date=%s. New balance=%.2f %s.',
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
                ' Destination "%s" balance=%.2f %s.',
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
                ->description('Transaction type.')
                ->enum([
                    TransactionType::INCOME->value,
                    TransactionType::EXPENSE->value,
                    TransactionType::TRANSFER->value,
                ])
                ->required(),
            'amount' => $schema->number()
                ->description('Transaction amount greater than zero.')
                ->required(),
            'transaction_date' => $schema->string()
                ->description('Optional date in YYYY-MM-DD format. Defaults to today if omitted.'),
            'description' => $schema->string()
                ->description('Optional human-readable transaction description.'),
            'account_id' => $schema->integer()
                ->description('Source account ID.'),
            'account_name' => $schema->string()
                ->description('Source account exact name if account_id is not provided.'),
            'category_id' => $schema->integer()
                ->description('Category ID. Required for income and expense.'),
            'category_name' => $schema->string()
                ->description('Category exact name. Required for income and expense when category_id is missing.'),
            'destination_account_id' => $schema->integer()
                ->description('Destination account ID. Required for transfers.'),
            'destination_account_name' => $schema->string()
                ->description('Destination account exact name if destination_account_id is not provided.'),
        ];
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
