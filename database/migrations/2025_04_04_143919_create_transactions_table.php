<?php

declare(strict_types=1);

use App\Models\Account;
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
        Schema::create('transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->string('type'); // 'expense', 'income', 'transfer'
            $table->decimal('amount', 15, 4);
            $table->date('transaction_date');
            $table->text('description')->nullable();

            $table->foreignIdFor(Account::class)->constrained()->cascadeOnDelete();

            $table->foreignId('destination_account_id')->nullable()->constrained('accounts')->cascadeOnDelete();

            $table->foreignIdFor(Category::class)->nullable()->constrained()->nullOnDelete();

            $table->decimal('conversion_rate', 15, 6)->nullable();
            $table->decimal('converted_amount', 15, 4)->nullable();

            $table->decimal('running_balance', 15, 4);

            $table->decimal('destination_running_balance', 15, 4)->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
