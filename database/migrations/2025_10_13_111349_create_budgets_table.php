<?php

declare(strict_types=1);

use App\Models\BudgetPeriod;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(User::class);
            $table->foreignIdFor(Category::class);
            $table->foreignIdFor(BudgetPeriod::class)->nullable(); // NULL for one-time budgets

            $table->string('type', 20); // 'period' or 'one_time'
            $table->string('name')->nullable(); // Optional name for the budget
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2); // Budget amount in user's base currency

            // For one-time budgets only
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // A user can only have one budget per category per period
            $table->unique(['user_id', 'category_id', 'budget_period_id']);

            // Index for efficient querying
            $table->index(['user_id', 'type']);
            $table->index(['category_id', 'start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
