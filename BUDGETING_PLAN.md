# Budgeting System Implementation Plan

## Overview
Implement a comprehensive budgeting system that supports category-based budgeting with flexible period definitions and one-time budgets.

## Database Schema Design

### 1. Budget Types Enum
```php
enum BudgetType: string
{
    case PERIOD = 'period';
    case ONE_TIME = 'one_time';
}

enum BudgetPeriodType: string  
{
    case MONTHLY = 'monthly';
    case WEEKLY = 'weekly';
    case YEARLY = 'yearly';
    case CUSTOM = 'custom';
}
```

### 2. Budget Periods Table
```sql
CREATE TABLE budget_periods (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL, -- 'Monthly', 'Weekly', 'Yearly', 'Custom Period'
    type ENUM('monthly', 'weekly', 'yearly', 'custom') NOT NULL,
    start_day INT NULL, -- For monthly: day of month (1-31), for weekly: day of week (0-6)
    duration_days INT NULL, -- For custom periods
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_period_name (user_id, name)
);
```

### 3. Budgets Table
```sql
CREATE TABLE budgets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    budget_period_id BIGINT UNSIGNED NULL, -- NULL for one-time budgets
    
    type VARCHAR(20) NOT NULL, -- 'period' or 'one_time'
    name VARCHAR(255) NULL, -- Optional name for the budget
    description TEXT NULL,
    amount DECIMAL(15,2) NOT NULL, -- Budget amount in user's base currency
    
    -- For one-time budgets only
    start_date DATE NULL,
    end_date DATE NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (budget_period_id) REFERENCES budget_periods(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_user_category_period (user_id, category_id, budget_period_id),
    INDEX idx_user_type (user_id, type),
    INDEX idx_category_dates (category_id, start_date, end_date)
);
```

**Key Simplifications:**
- Removed `currency_id` - budgets are in user's base currency
- Removed separate `budget_transactions` table - we calculate spending by matching transactions to budgets via category and date
- Removed `budget_alerts` table - keeping it simple for now
- Using enum for budget types instead of separate table

## Laravel Implementation Plan

### Phase 1: Core Models and Relationships

#### 1.1 Create Models
- `BudgetType` model
- `BudgetPeriod` model
- `Budget` model
- `BudgetTransaction` model
- `BudgetAlert` model

#### 1.2 Model Relationships
```php
// Budget.php
public function user(): BelongsTo { return $this->belongsTo(User::class); }
public function category(): BelongsTo { return $this->belongsTo(Category::class); }
public function currency(): BelongsTo { return $this->belongsTo(Currency::class); }
public function budgetType(): BelongsTo { return $this->belongsTo(BudgetType::class); }
public function budgetPeriod(): BelongsTo { return $this->belongsTo(BudgetPeriod::class); }
public function budgetTransactions(): HasMany { return $this->hasMany(BudgetTransaction::class); }
public function alerts(): HasMany { return $this->hasMany(BudgetAlert::class); }

// User.php
public function budgets(): HasMany { return $this->hasMany(Budget::class); }
public function budgetPeriods(): HasMany { return $this->hasMany(BudgetPeriod::class); }

// Category.php
public function budgets(): HasMany { return $this->hasMany(Budget::class); }

// Transaction.php
public function budgetTransactions(): HasMany { return $this->hasMany(BudgetTransaction::class); }
```

### Phase 2: Business Logic and Services

#### 2.1 Budget Services
- `BudgetCalculationService`: Calculate spent amounts, remaining budget, progress
- `BudgetPeriodService`: Handle period calculations, next period generation
- `BudgetAllocationService`: Automatically assign transactions to budgets
- `BudgetAlertService`: Handle threshold alerts and notifications

#### 2.2 Actions
- `CreateBudgetAction`
- `UpdateBudgetAction`
- `DeleteBudgetAction`
- `CreateBudgetPeriodAction`
- `AssignTransactionToBudgetAction`

#### 2.3 DTOs
- `CreateBudgetDto`
- `UpdateBudgetDto`
- `BudgetPeriodDto`
- `BudgetSummaryDto`

### Phase 3: API Controllers

#### 3.1 Budget Controllers
- `BudgetController`: CRUD operations for budgets
- `BudgetPeriodController`: Manage budget periods
- `BudgetReportController`: Budget vs actual reports
- `BudgetAlertController`: Manage budget alerts

#### 3.2 Form Requests
- `CreateBudgetRequest`
- `UpdateBudgetRequest`
- `CreateBudgetPeriodRequest`

### Phase 4: Frontend Implementation

#### 4.1 Budget Management Pages
- `budgets/index.tsx`: List all budgets with progress bars
- `budgets/create.tsx`: Create new budget form
- `budgets/edit.tsx`: Edit budget form
- `budgets/show.tsx`: Budget details with spending breakdown

#### 4.2 Budget Period Management
- `budget-periods/index.tsx`: Manage budget periods
- `budget-periods/create.tsx`: Create custom periods

#### 4.3 Budget Reports
- `reports/budget-summary.tsx`: Overall budget performance
- `reports/category-breakdown.tsx`: Spending by category vs budget

### Phase 5: Integration with Transactions

#### 5.1 Transaction Integration
- Modify `TransactionController` to auto-assign to budgets
- Add budget selection to transaction forms
- Update transaction editing to recalculate budget allocations

#### 5.2 Real-time Updates
- Update budget progress when transactions are added/modified
- Trigger alerts when thresholds are reached

## Key Features Implementation

### 1. Period Budget Logic
```php
class BudgetPeriodService
{
    public function getCurrentPeriod(BudgetPeriod $budgetPeriod, Carbon $date): array
    {
        return match ($budgetPeriod->type) {
            'monthly' => $this->calculateMonthlyPeriod($budgetPeriod, $date),
            'weekly' => $this->calculateWeeklyPeriod($budgetPeriod, $date),
            'yearly' => $this->calculateYearlyPeriod($budgetPeriod, $date),
            'custom' => $this->calculateCustomPeriod($budgetPeriod, $date),
        };
    }
    
    private function calculateMonthlyPeriod(BudgetPeriod $period, Carbon $date): array
    {
        $startDay = $period->start_day ?? 1;
        
        if ($date->day >= $startDay) {
            $start = $date->copy()->day($startDay);
            $end = $start->copy()->addMonth()->subDay();
        } else {
            $end = $date->copy()->day($startDay)->subDay();
            $start = $end->copy()->subMonth()->addDay();
        }
        
        return ['start' => $start, 'end' => $end];
    }
}
```

### 2. Budget Calculation Logic
```php
class BudgetCalculationService
{
    public function calculateBudgetSummary(Budget $budget): BudgetSummaryDto
    {
        // Get the date range for this budget
        $dateRange = $this->getDateRangeForBudget($budget);
        
        // Find all expense transactions in this category within the date range
        $transactions = Transaction::where('category_id', $budget->category_id)
            ->where('type', TransactionType::EXPENSE)
            ->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
            ->get();
        
        // Sum up the spending (convert to user's base currency if needed)
        $totalSpent = $transactions->sum(function ($transaction) {
            return $this->convertToBaseCurrency($transaction);
        });
        
        $remaining = $budget->amount - $totalSpent;
        $percentageUsed = $budget->amount > 0 ? ($totalSpent / $budget->amount) * 100 : 0;
        
        return new BudgetSummaryDto(
            budget: $budget,
            totalSpent: $totalSpent,
            remaining: $remaining,
            percentageUsed: $percentageUsed,
            isOverBudget: $remaining < 0,
            dateRange: $dateRange
        );
    }
    
    private function getDateRangeForBudget(Budget $budget): array
    {
        if ($budget->type === BudgetType::ONE_TIME) {
            return [
                'start' => $budget->start_date,
                'end' => $budget->end_date
            ];
        }
        
        // For period budgets, use the budget period's dates
        return [
            'start' => $budget->budgetPeriod->start_date,
            'end' => $budget->budgetPeriod->end_date
        ];
    }
    
    private function convertToBaseCurrency(Transaction $transaction): float
    {
        $accountCurrency = $transaction->account->currency;
        $userBaseCurrency = $transaction->account->user->currencies()
            ->where('is_base', true)
            ->first();
            
        if ($accountCurrency->id === $userBaseCurrency->id) {
            return $transaction->amount;
        }
        
        // Convert using current conversion rate
        return $transaction->amount * $accountCurrency->conversion_rate;
    }
}
```

### 3. Auto Budget Assignment
```php
class BudgetAllocationService
{
    public function assignTransactionToBudgets(Transaction $transaction): void
    {
        $activeBudgets = $this->getActiveBudgetsForCategory(
            $transaction->category_id,
            $transaction->date
        );
        
        foreach ($activeBudgets as $budget) {
            $convertedAmount = $this->convertCurrency(
                $transaction->amount,
                $transaction->account->currency_id,
                $budget->currency_id
            );
            
            BudgetTransaction::create([
                'budget_id' => $budget->id,
                'transaction_id' => $transaction->id,
                'amount' => $convertedAmount,
                'exchange_rate' => $this->getExchangeRate(
                    $transaction->account->currency_id,
                    $budget->currency_id
                )
            ]);
        }
    }
}
```

## Migration Order
1. Create budget_types table with seeders
2. Create budget_periods table
3. Create budgets table
4. Create budget_transactions table
5. Create budget_alerts table

## Testing Strategy
1. Unit tests for all budget calculation logic
2. Feature tests for budget CRUD operations
3. Integration tests for transaction-budget assignment
4. Browser tests for budget UI interactions

## Performance Considerations
1. Index on frequently queried columns (user_id, category_id, dates)
2. Cache budget summaries for expensive calculations
3. Use database triggers for real-time balance updates
4. Pagination for budget transaction lists

This implementation provides a flexible foundation that can be extended with additional features like budget templates, collaborative budgets, and advanced reporting.