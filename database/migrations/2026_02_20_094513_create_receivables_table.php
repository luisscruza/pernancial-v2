<?php

declare(strict_types=1);

use App\Models\Contact;
use App\Models\Currency;
use App\Models\ReceivableSeries;
use App\Models\Transaction;
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
        Schema::create('receivables', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Contact::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Currency::class)->constrained();
            $table->foreignIdFor(ReceivableSeries::class)->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount_total', 15, 4);
            $table->decimal('amount_paid', 15, 4)->default(0);
            $table->string('status')->default('open');
            $table->text('description')->nullable();
            $table->date('due_date');
            $table->foreignIdFor(Transaction::class, 'origin_transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receivables');
    }
};
