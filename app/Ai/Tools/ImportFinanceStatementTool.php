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

final class ImportFinanceStatementTool implements Tool
{
    public function __construct(private User $user) {}

    public function description(): Stringable|string
    {
        return 'Importa movimientos desde estados de cuenta, detecta posibles duplicados con fechas cercanas y permite agrupar compras repetidas.';
    }

    public function handle(Request $request): Stringable|string
    {
        $mode = $this->resolveMode($this->toString($request['mode'] ?? null));
        $groupStrategy = $this->resolveGroupStrategy($this->toString($request['group_strategy'] ?? null));
        $duplicateWindowDays = $this->resolveDuplicateWindowDays($request['duplicate_window_days'] ?? null);
        $createIfDuplicate = $this->toBool($request['create_if_duplicate'] ?? false);
        $forceDuplicateIndexes = $this->toIntList($request['force_duplicate_indexes'] ?? []);

        $entries = $this->normalizeEntries($request);

        if ($entries === []) {
            return 'No se recibieron movimientos para importar. Envia entries con al menos un registro.';
        }

        $entries = $this->applyGrouping($entries, $groupStrategy);

        $processedCount = count($entries);
        $invalidCount = 0;
        $duplicateCount = 0;
        $createdCount = 0;
        $createdForcedCount = 0;
        $skippedDuplicateCount = 0;
        $newCandidateCount = 0;
        $failedCount = 0;

        $invalidLines = [];
        $newLines = [];
        $duplicateLines = [];
        $createdLines = [];

        foreach ($entries as $entry) {
            if ($entry['errors'] !== []) {
                $invalidCount++;
                $invalidLines[] = sprintf(
                    '- #%d: %s',
                    $entry['display_index'],
                    implode(' | ', $entry['errors']),
                );

                continue;
            }

            $duplicate = $this->findPotentialDuplicate($entry, $duplicateWindowDays);

            if ($duplicate === null) {
                $newCandidateCount++;

                if ($mode === 'preview') {
                    $newLines[] = sprintf(
                        '- #%d: %s',
                        $entry['display_index'],
                        $this->describeEntry($entry),
                    );

                    continue;
                }

                $creationError = $this->createTransaction($entry);

                if ($creationError === null) {
                    $createdCount++;
                    $createdLines[] = sprintf('- #%d: %s', $entry['display_index'], $this->describeEntry($entry));
                } else {
                    $failedCount++;
                    $invalidLines[] = sprintf('- #%d: %s', $entry['display_index'], $creationError);
                }

                continue;
            }

            $duplicateCount++;

            $duplicateLines[] = sprintf(
                '- #%d: %s | posible duplicado por %s.',
                $entry['display_index'],
                $this->describeEntry($entry),
                $duplicate['reason'],
            );

            if ($mode === 'preview') {
                continue;
            }

            $isForced = $createIfDuplicate || $this->entryIsForced($entry, $forceDuplicateIndexes);

            if (! $isForced) {
                $skippedDuplicateCount++;

                continue;
            }

            $creationError = $this->createTransaction($entry);

            if ($creationError === null) {
                $createdCount++;
                $createdForcedCount++;
                $createdLines[] = sprintf('- #%d: %s', $entry['display_index'], $this->describeEntry($entry));
            } else {
                $failedCount++;
                $invalidLines[] = sprintf('- #%d: %s', $entry['display_index'], $creationError);
            }
        }

        $modeLabel = $mode === 'commit' ? 'commit' : 'preview';
        $summary = [
            sprintf('Resultado de importacion (%s):', $modeLabel),
            sprintf('- movimientos_procesados=%d', $processedCount),
            sprintf('- nuevos_sin_duplicado=%d', $newCandidateCount),
            sprintf('- posibles_duplicados=%d', $duplicateCount),
            sprintf('- invalidos=%d', $invalidCount + $failedCount),
        ];

        if ($mode === 'commit') {
            $summary[] = sprintf('- creados=%d', $createdCount);
            $summary[] = sprintf('- creados_forzando_duplicado=%d', $createdForcedCount);
            $summary[] = sprintf('- duplicados_omitidos=%d', $skippedDuplicateCount);
        }

        $sections = [implode("\n", $summary)];

        if ($newLines !== []) {
            $sections[] = "Nuevos candidatos:\n".$this->implodeLimitedLines($newLines);
        }

        if ($duplicateLines !== []) {
            $sections[] = "Posibles duplicados:\n".$this->implodeLimitedLines($duplicateLines);
        }

        if ($createdLines !== []) {
            $sections[] = "Movimientos creados:\n".$this->implodeLimitedLines($createdLines);
        }

        if ($invalidLines !== []) {
            $sections[] = "Requieren revision:\n".$this->implodeLimitedLines($invalidLines);
        }

        if ($mode === 'preview') {
            $sections[] = 'Para registrar automaticamente los nuevos movimientos usa mode=commit. Para permitir duplicados detectados usa create_if_duplicate=true o force_duplicate_indexes.';
        }

        return implode("\n\n", $sections);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'mode' => $schema->string()
                ->description('Modo de ejecucion: preview analiza sin crear, commit crea transacciones nuevas.')
                ->enum(['preview', 'commit']),
            'group_strategy' => $schema->string()
                ->description('Estrategia de agrupacion previa: none, manual_keys o supermarket_monthly.')
                ->enum(['none', 'manual_keys', 'supermarket_monthly']),
            'duplicate_window_days' => $schema->integer()
                ->description('Ventana en dias para buscar duplicados por fecha cercana. Minimo 1, maximo 30. Por defecto 7.'),
            'create_if_duplicate' => $schema->boolean()
                ->description('Si es true y mode=commit, permite crear incluso cuando se detecta posible duplicado.'),
            'force_duplicate_indexes' => $schema->array()
                ->description('Indices de movimientos originales para forzar creacion en mode=commit aun con posible duplicado.')
                ->items($schema->integer()),
            'account_id' => $schema->integer()
                ->description('Cuenta por defecto para todos los movimientos cuando no viene en cada entry.'),
            'account_name' => $schema->string()
                ->description('Nombre de cuenta por defecto cuando no viene account_id o account_name por entry.'),
            'default_expense_category_id' => $schema->integer()
                ->description('Categoria de gasto por defecto para entries tipo expense sin categoria individual.'),
            'default_expense_category_name' => $schema->string()
                ->description('Nombre de categoria de gasto por defecto para entries tipo expense sin categoria individual.'),
            'default_income_category_id' => $schema->integer()
                ->description('Categoria de ingreso por defecto para entries tipo income sin categoria individual.'),
            'default_income_category_name' => $schema->string()
                ->description('Nombre de categoria de ingreso por defecto para entries tipo income sin categoria individual.'),
            'entries' => $schema->array()
                ->description('Lista de movimientos extraidos del estado de cuenta o imagen.')
                ->items($schema->object([
                    'type' => $schema->string()
                        ->description('Tipo del movimiento: expense o income.')
                        ->enum(['expense', 'income']),
                    'amount' => $schema->number()
                        ->description('Monto del movimiento mayor que cero.')
                        ->required(),
                    'transaction_date' => $schema->string()
                        ->description('Fecha de la transaccion en formato YYYY-MM-DD, DD/MM/YYYY o DD-MM-YYYY.'),
                    'posted_date' => $schema->string()
                        ->description('Fecha de contabilizacion en formato YYYY-MM-DD, DD/MM/YYYY o DD-MM-YYYY.'),
                    'description' => $schema->string()
                        ->description('Descripcion del movimiento.'),
                    'merchant' => $schema->string()
                        ->description('Comercio o contraparte del movimiento.'),
                    'reference' => $schema->string()
                        ->description('Referencia opcional del estado de cuenta.'),
                    'account_id' => $schema->integer()
                        ->description('Cuenta especifica para este movimiento.'),
                    'account_name' => $schema->string()
                        ->description('Nombre de cuenta especifica para este movimiento.'),
                    'category_id' => $schema->integer()
                        ->description('Categoria especifica para este movimiento.'),
                    'category_name' => $schema->string()
                        ->description('Nombre de categoria especifica para este movimiento.'),
                    'group_key' => $schema->string()
                        ->description('Clave de agrupacion manual cuando group_strategy=manual_keys.'),
                    'group_description' => $schema->string()
                        ->description('Descripcion final para el movimiento agrupado con la misma group_key.'),
                ]))
                ->min(1)
                ->max(120)
                ->required(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function normalizeEntries(Request $request): array
    {
        $entriesRaw = $request['entries'] ?? null;

        if (! is_array($entriesRaw)) {
            return [];
        }

        $defaultAccount = $this->resolveAccount(
            id: $this->toInt($request['account_id'] ?? null),
            name: $this->toString($request['account_name'] ?? null),
        );

        $defaultExpenseCategory = $this->resolveCategory(
            id: $this->toInt($request['default_expense_category_id'] ?? null),
            name: $this->toString($request['default_expense_category_name'] ?? null),
            expectedType: CategoryType::EXPENSE,
        );

        $defaultIncomeCategory = $this->resolveCategory(
            id: $this->toInt($request['default_income_category_id'] ?? null),
            name: $this->toString($request['default_income_category_name'] ?? null),
            expectedType: CategoryType::INCOME,
        );

        $entries = [];

        foreach ($entriesRaw as $index => $entryRaw) {
            $entryIndex = $index + 1;
            $entry = is_array($entryRaw) ? $entryRaw : [];
            $errors = [];

            $type = TransactionType::tryFrom((string) ($entry['type'] ?? TransactionType::EXPENSE->value));

            if (! in_array($type, [TransactionType::EXPENSE, TransactionType::INCOME], true)) {
                $errors[] = 'tipo invalido, usa expense o income';
                $type = TransactionType::EXPENSE;
            }

            $amount = $this->toFloat($entry['amount'] ?? null);

            if ($amount === null || $amount <= 0) {
                $errors[] = 'monto invalido, debe ser mayor que cero';
                $amount = 0.0;
            }

            $transactionDate = $this->parseDateToYmd(
                $entry['transaction_date'] ?? ($entry['posted_date'] ?? null),
            );

            if ($transactionDate === null) {
                $transactionDate = now()->toDateString();
            }

            $entryAccount = $this->resolveAccount(
                id: $this->toInt($entry['account_id'] ?? null),
                name: $this->toString($entry['account_name'] ?? null),
            );

            $account = $entryAccount ?? $defaultAccount;

            if (! $account) {
                $errors[] = 'no se pudo resolver la cuenta';
            }

            $expectedCategoryType = $type === TransactionType::INCOME
                ? CategoryType::INCOME
                : CategoryType::EXPENSE;

            $entryCategory = $this->resolveCategory(
                id: $this->toInt($entry['category_id'] ?? null),
                name: $this->toString($entry['category_name'] ?? null),
                expectedType: $expectedCategoryType,
            );

            $defaultCategory = $expectedCategoryType === CategoryType::INCOME
                ? $defaultIncomeCategory
                : $defaultExpenseCategory;

            $category = $entryCategory ?? $defaultCategory;

            if (! $category) {
                $errors[] = sprintf('falta categoria de tipo %s', $expectedCategoryType->value);
            }

            $description = $this->toString($entry['description'] ?? null);
            $merchant = $this->toString($entry['merchant'] ?? null);

            if ($description === null && $merchant !== null) {
                $description = $merchant;
            }

            if ($description === null) {
                $description = 'Movimiento importado';
            }

            $reference = $this->toString($entry['reference'] ?? null);

            if ($reference !== null) {
                $description = mb_substr(sprintf('%s | ref %s', $description, $reference), 0, 255);
            } else {
                $description = mb_substr($description, 0, 255);
            }

            $entries[] = [
                'display_index' => $entryIndex,
                'source_indexes' => [$entryIndex],
                'type' => $type,
                'amount' => $amount,
                'transaction_date' => $transactionDate,
                'description' => $description,
                'merchant' => $merchant,
                'group_key' => $this->toString($entry['group_key'] ?? null),
                'group_description' => $this->toString($entry['group_description'] ?? null),
                'account' => $account,
                'category' => $category,
                'errors' => $errors,
            ];
        }

        return $entries;
    }

    /**
     * @param  array<int, array<string, mixed>>  $entries
     * @return array<int, array<string, mixed>>
     */
    private function applyGrouping(array $entries, string $groupStrategy): array
    {
        if ($groupStrategy === 'none') {
            return $entries;
        }

        $groupedEntries = [];
        $groupedIndexes = [];

        foreach ($entries as $entry) {
            if ($entry['errors'] !== []) {
                $groupedEntries[] = $entry;

                continue;
            }

            $groupKey = $this->resolveGroupingKey($entry, $groupStrategy);

            if ($groupKey === null) {
                $groupedEntries[] = $entry;

                continue;
            }

            $accountId = $entry['account'] instanceof Account ? $entry['account']->id : 0;
            $categoryId = $entry['category'] instanceof Category ? $entry['category']->id : 0;
            $compositeKey = sprintf(
                '%s|%s|%d|%d',
                $groupKey,
                $entry['type']->value,
                $accountId,
                $categoryId,
            );

            if (! array_key_exists($compositeKey, $groupedIndexes)) {
                $groupedIndexes[$compositeKey] = count($groupedEntries);
                $groupedEntries[] = $entry;

                continue;
            }

            $existingEntryIndex = $groupedIndexes[$compositeKey];
            $existingEntry = $groupedEntries[$existingEntryIndex];

            $existingEntry['amount'] = round((float) $existingEntry['amount'] + (float) $entry['amount'], 2);
            $existingEntry['transaction_date'] = max(
                (string) $existingEntry['transaction_date'],
                (string) $entry['transaction_date'],
            );
            $existingEntry['source_indexes'] = array_values(array_unique(array_merge(
                $existingEntry['source_indexes'],
                $entry['source_indexes'],
            )));

            if ($existingEntry['group_description'] !== null) {
                $existingEntry['description'] = mb_substr((string) $existingEntry['group_description'], 0, 255);
            }

            if ($existingEntry['group_description'] === null && $entry['group_description'] !== null) {
                $existingEntry['description'] = mb_substr((string) $entry['group_description'], 0, 255);
            }

            if ($groupStrategy === 'supermarket_monthly') {
                $month = mb_substr((string) $existingEntry['transaction_date'], 0, 7);
                $existingEntry['description'] = mb_substr(sprintf('Supermercados agrupados %s', $month), 0, 255);
            }

            $groupedEntries[$existingEntryIndex] = $existingEntry;
        }

        foreach ($groupedEntries as &$entry) {
            if (count($entry['source_indexes']) > 1) {
                sort($entry['source_indexes']);
                $entry['display_index'] = min($entry['source_indexes']);
            }
        }

        return array_values($groupedEntries);
    }

    /**
     * @param  array<string, mixed>  $entry
     */
    private function resolveGroupingKey(array $entry, string $groupStrategy): ?string
    {
        if ($groupStrategy === 'manual_keys') {
            $groupKey = $this->toString($entry['group_key'] ?? null);

            return $groupKey !== null ? mb_strtolower($groupKey) : null;
        }

        if ($groupStrategy !== 'supermarket_monthly') {
            return null;
        }

        if ($entry['type'] !== TransactionType::EXPENSE) {
            return null;
        }

        if (! $this->isSupermarketMovement((string) $entry['description'])) {
            return null;
        }

        $month = mb_substr((string) $entry['transaction_date'], 0, 7);
        $accountId = $entry['account'] instanceof Account ? $entry['account']->id : 0;
        $categoryId = $entry['category'] instanceof Category ? $entry['category']->id : 0;

        return sprintf('supermarket:%d:%d:%s', $accountId, $categoryId, $month);
    }

    private function isSupermarketMovement(string $description): bool
    {
        $normalized = $this->normalizeText($description);

        if ($normalized === '') {
            return false;
        }

        $keywords = [
            'supermercado',
            'super market',
            'supermarket',
            'walmart',
            'costco',
            'chedraui',
            'soriana',
            'la comer',
            'fresko',
            'heb',
            'bodega aurrera',
            'mercado',
        ];

        foreach ($keywords as $keyword) {
            if (str_contains($normalized, $this->normalizeText($keyword))) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $entry
     * @return array{reason: string, score: int}|null
     */
    private function findPotentialDuplicate(array $entry, int $duplicateWindowDays): ?array
    {
        if (! $entry['account'] instanceof Account) {
            return null;
        }

        $entryDate = CarbonImmutable::createFromFormat('Y-m-d', $entry['transaction_date']);

        if (! $entryDate) {
            return null;
        }

        $amountTolerance = max(1.0, round(((float) $entry['amount']) * 0.03, 2));

        $candidates = Transaction::query()
            ->where('account_id', $entry['account']->id)
            ->where('type', $entry['type'])
            ->whereBetween('transaction_date', [
                $entryDate->subDays($duplicateWindowDays)->format('Y-m-d'),
                $entryDate->addDays($duplicateWindowDays)->format('Y-m-d'),
            ])
            ->whereBetween('amount', [
                max(0, (float) $entry['amount'] - $amountTolerance),
                (float) $entry['amount'] + $amountTolerance,
            ])
            ->with(['account.currency', 'category'])
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        $bestMatch = null;
        $bestScore = 0;
        $bestReason = '';

        foreach ($candidates as $candidate) {
            $scored = $this->scoreDuplicateCandidate($entry, $candidate, $duplicateWindowDays);

            if ($scored['score'] <= $bestScore) {
                continue;
            }

            $bestMatch = $candidate;
            $bestScore = $scored['score'];
            $bestReason = $scored['reason'];
        }

        if (! $bestMatch || $bestScore < 65) {
            return null;
        }

        $reason = sprintf(
            '%s (score=%d, registro existente fecha=%s, monto=%.2f)',
            $bestReason,
            $bestScore,
            $bestMatch->transaction_date->format('Y-m-d'),
            $bestMatch->amount,
        );

        return [
            'reason' => $reason,
            'score' => $bestScore,
        ];
    }

    /**
     * @param  array<string, mixed>  $entry
     * @return array{score: int, reason: string}
     */
    private function scoreDuplicateCandidate(array $entry, Transaction $candidate, int $duplicateWindowDays): array
    {
        $score = 0;
        $reasons = [];

        $amountDifference = abs((float) $candidate->amount - (float) $entry['amount']);

        if ($amountDifference <= 0.01) {
            $score += 45;
            $reasons[] = 'monto exacto';
        } elseif ($amountDifference <= max(0.5, ((float) $entry['amount']) * 0.01)) {
            $score += 30;
            $reasons[] = 'monto muy cercano';
        } elseif ($amountDifference <= max(1.0, ((float) $entry['amount']) * 0.03)) {
            $score += 15;
            $reasons[] = 'monto cercano';
        }

        $dateDifference = abs($candidate->transaction_date->diffInDays((string) $entry['transaction_date']));

        if ($dateDifference === 0) {
            $score += 30;
            $reasons[] = 'misma fecha';
        } elseif ($dateDifference <= 2) {
            $score += 22;
            $reasons[] = 'fecha muy cercana';
        } elseif ($dateDifference <= 7) {
            $score += 15;
            $reasons[] = 'fecha cercana';
        } elseif ($dateDifference <= $duplicateWindowDays) {
            $score += 8;
            $reasons[] = 'fecha en ventana';
        }

        $entryCategoryId = $entry['category'] instanceof Category ? $entry['category']->id : null;

        if ($entryCategoryId !== null && $candidate->category_id === $entryCategoryId) {
            $score += 12;
            $reasons[] = 'misma categoria';
        }

        $descriptionSimilarity = $this->descriptionSimilarity(
            (string) $entry['description'],
            (string) ($candidate->description ?? ''),
        );

        if ($descriptionSimilarity >= 90) {
            $score += 25;
            $reasons[] = 'descripcion muy similar';
        } elseif ($descriptionSimilarity >= 75) {
            $score += 16;
            $reasons[] = 'descripcion similar';
        } elseif ($descriptionSimilarity >= 60) {
            $score += 8;
            $reasons[] = 'descripcion parecida';
        }

        if ($reasons === []) {
            $reasons[] = 'patron coincidente';
        }

        return [
            'score' => $score,
            'reason' => implode(', ', $reasons),
        ];
    }

    private function descriptionSimilarity(string $descriptionA, string $descriptionB): float
    {
        $normalizedA = $this->normalizeText($descriptionA);
        $normalizedB = $this->normalizeText($descriptionB);

        if ($normalizedA === '' || $normalizedB === '') {
            return 0.0;
        }

        if ($normalizedA === $normalizedB) {
            return 100.0;
        }

        similar_text($normalizedA, $normalizedB, $similarity);

        return $similarity;
    }

    private function normalizeText(string $value): string
    {
        $normalized = mb_strtolower($value);
        $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $normalized);

        if (is_string($ascii) && $ascii !== '') {
            $normalized = $ascii;
        }

        $withoutSymbols = preg_replace('/[^a-z0-9\s]/', ' ', $normalized) ?? $normalized;
        $collapsed = preg_replace('/\s+/', ' ', $withoutSymbols) ?? $withoutSymbols;

        return mb_trim($collapsed);
    }

    /**
     * @param  array<string, mixed>  $entry
     */
    private function createTransaction(array $entry): ?string
    {
        if (! $entry['account'] instanceof Account) {
            return 'no se pudo crear: cuenta invalida';
        }

        if (! $entry['category'] instanceof Category) {
            return 'no se pudo crear: categoria invalida';
        }

        $dto = new CreateTransactionDto(
            type: $entry['type'],
            amount: (float) $entry['amount'],
            personal_amount: null,
            transaction_date: (string) $entry['transaction_date'],
            description: (string) $entry['description'],
            destination_account: null,
            category: $entry['category'],
            conversion_rate: 1.0,
            received_amount: null,
            ai_assisted: true,
            splits: [],
            is_shared: false,
            shared_receivables: [],
        );

        try {
            app(CreateTransactionAction::class)->handle($entry['account'], $dto);
        } catch (Throwable $exception) {
            return sprintf('no se pudo crear: %s', $exception->getMessage());
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $entry
     */
    private function describeEntry(array $entry): string
    {
        $accountName = $entry['account'] instanceof Account
            ? $entry['account']->name
            : 'Cuenta no resuelta';

        $currencyCode = $entry['account'] instanceof Account
            ? ($entry['account']->currency->code ?? 'N/A')
            : 'N/A';

        $categoryName = $entry['category'] instanceof Category
            ? $entry['category']->name
            : 'Categoria no resuelta';

        $sourcesCount = count($entry['source_indexes']);
        $sourceSuffix = $sourcesCount > 1
            ? sprintf(', agrupado=%d', $sourcesCount)
            : '';

        return sprintf(
            'fecha=%s, tipo=%s, monto=%.2f %s, cuenta="%s", categoria="%s", descripcion="%s"%s',
            $entry['transaction_date'],
            $entry['type']->value,
            $entry['amount'],
            $currencyCode,
            $accountName,
            $categoryName,
            mb_substr((string) $entry['description'], 0, 120),
            $sourceSuffix,
        );
    }

    /**
     * @param  array<string, mixed>  $entry
     * @param  array<int, int>  $forceDuplicateIndexes
     */
    private function entryIsForced(array $entry, array $forceDuplicateIndexes): bool
    {
        foreach ($entry['source_indexes'] as $sourceIndex) {
            if (in_array((int) $sourceIndex, $forceDuplicateIndexes, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, string>  $lines
     */
    private function implodeLimitedLines(array $lines, int $limit = 12): string
    {
        if (count($lines) <= $limit) {
            return implode("\n", $lines);
        }

        $visible = array_slice($lines, 0, $limit);
        $remaining = count($lines) - $limit;
        $visible[] = sprintf('- ... %d mas', $remaining);

        return implode("\n", $visible);
    }

    private function resolveMode(?string $mode): string
    {
        if ($mode === 'commit') {
            return 'commit';
        }

        return 'preview';
    }

    private function resolveGroupStrategy(?string $groupStrategy): string
    {
        return match ($groupStrategy) {
            'manual_keys' => 'manual_keys',
            'supermarket_monthly' => 'supermarket_monthly',
            default => 'none',
        };
    }

    private function resolveDuplicateWindowDays(mixed $value): int
    {
        $window = $this->toInt($value) ?? 7;

        if ($window < 1) {
            return 1;
        }

        if ($window > 30) {
            return 30;
        }

        return $window;
    }

    private function resolveAccount(?int $id, ?string $name): ?Account
    {
        if ($id !== null) {
            $account = Account::query()
                ->where('user_id', $this->user->id)
                ->where('id', $id)
                ->with('currency')
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
            ->with('currency')
            ->first();
    }

    private function resolveCategory(?int $id, ?string $name, CategoryType $expectedType): ?Category
    {
        if ($id !== null) {
            $category = Category::query()
                ->where('user_id', $this->user->id)
                ->where('id', $id)
                ->where('type', $expectedType)
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
            ->where('type', $expectedType)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        if ($exactMatch) {
            return $exactMatch;
        }

        return Category::query()
            ->where('user_id', $this->user->id)
            ->where('type', $expectedType)
            ->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($name).'%'])
            ->orderBy('name')
            ->first();
    }

    /**
     * @return array<int, int>
     */
    private function toIntList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $values = [];

        foreach ($value as $item) {
            $intValue = $this->toInt($item);

            if ($intValue !== null && $intValue > 0) {
                $values[] = $intValue;
            }
        }

        return array_values(array_unique($values));
    }

    private function parseDateToYmd(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $date = $this->toString($value);

        if ($date === null) {
            return null;
        }

        $formats = ['Y-m-d', 'd/m/Y', 'd-m-Y'];

        foreach ($formats as $format) {
            try {
                $parsed = CarbonImmutable::createFromFormat($format, $date);
            } catch (Throwable) {
                continue;
            }

            if ($parsed && $parsed->format($format) === $date) {
                return $parsed->format('Y-m-d');
            }
        }

        return null;
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
