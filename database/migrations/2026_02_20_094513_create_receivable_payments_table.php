<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Receivable;
use App\Models\Transaction;
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
        if (Schema::hasTable('receivable_payments')) {
            return;
        }

        Schema::create('receivable_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(Receivable::class);
            $table->foreignIdFor(Account::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Transaction::class)->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 15, 4);
            $table->date('paid_at');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receivable_payments');
    }
};
