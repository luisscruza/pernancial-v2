<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Contact;
use App\Models\Currency;
use App\Models\Receivable;
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
        if (Schema::hasTable('contacts')) {
            Schema::table('contacts', function (Blueprint $table): void {
                if (! Schema::hasColumn('contacts', 'user_id')) {
                    $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
                }
                if (! Schema::hasColumn('contacts', 'name')) {
                    $table->string('name');
                }
                if (! Schema::hasColumn('contacts', 'email')) {
                    $table->string('email')->nullable();
                }
                if (! Schema::hasColumn('contacts', 'phone')) {
                    $table->string('phone')->nullable();
                }
                if (! Schema::hasColumn('contacts', 'notes')) {
                    $table->text('notes')->nullable();
                }
            });
        }

        if (Schema::hasTable('receivable_series')) {
            Schema::table('receivable_series', function (Blueprint $table): void {
                if (! Schema::hasColumn('receivable_series', 'user_id')) {
                    $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
                }
                if (! Schema::hasColumn('receivable_series', 'contact_id')) {
                    $table->foreignIdFor(Contact::class)->constrained()->cascadeOnDelete();
                }
                if (! Schema::hasColumn('receivable_series', 'currency_id')) {
                    $table->foreignIdFor(Currency::class)->constrained();
                }
                if (! Schema::hasColumn('receivable_series', 'name')) {
                    $table->string('name');
                }
                if (! Schema::hasColumn('receivable_series', 'default_amount')) {
                    $table->decimal('default_amount', 15, 4);
                }
                if (! Schema::hasColumn('receivable_series', 'is_recurring')) {
                    $table->boolean('is_recurring')->default(false);
                }
                if (! Schema::hasColumn('receivable_series', 'recurrence_rule')) {
                    $table->json('recurrence_rule')->nullable();
                }
                if (! Schema::hasColumn('receivable_series', 'next_due_date')) {
                    $table->date('next_due_date')->nullable();
                }
            });
        }

        if (Schema::hasTable('receivables')) {
            Schema::table('receivables', function (Blueprint $table): void {
                if (! Schema::hasColumn('receivables', 'user_id')) {
                    $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
                }
                if (! Schema::hasColumn('receivables', 'contact_id')) {
                    $table->foreignIdFor(Contact::class)->constrained()->cascadeOnDelete();
                }
                if (! Schema::hasColumn('receivables', 'currency_id')) {
                    $table->foreignIdFor(Currency::class)->constrained();
                }
                if (! Schema::hasColumn('receivables', 'receivable_series_id')) {
                    $table->foreignIdFor(ReceivableSeries::class)->nullable()->constrained()->nullOnDelete();
                }
                if (! Schema::hasColumn('receivables', 'amount_total')) {
                    $table->decimal('amount_total', 15, 4);
                }
                if (! Schema::hasColumn('receivables', 'amount_paid')) {
                    $table->decimal('amount_paid', 15, 4)->default(0);
                }
                if (! Schema::hasColumn('receivables', 'status')) {
                    $table->string('status')->default('open');
                }
                if (! Schema::hasColumn('receivables', 'description')) {
                    $table->text('description')->nullable();
                }
                if (! Schema::hasColumn('receivables', 'due_date')) {
                    $table->date('due_date');
                }
                if (! Schema::hasColumn('receivables', 'origin_transaction_id')) {
                    $table->foreignIdFor(Transaction::class, 'origin_transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
                }
            });
        }

        if (Schema::hasTable('receivable_payments')) {
            Schema::table('receivable_payments', function (Blueprint $table): void {
                if (! Schema::hasColumn('receivable_payments', 'receivable_id')) {
                    $table->foreignIdFor(Receivable::class)->constrained()->cascadeOnDelete();
                }
                if (! Schema::hasColumn('receivable_payments', 'account_id')) {
                    $table->foreignIdFor(Account::class)->constrained()->cascadeOnDelete();
                }
                if (! Schema::hasColumn('receivable_payments', 'transaction_id')) {
                    $table->foreignIdFor(Transaction::class)->nullable()->constrained()->nullOnDelete();
                }
                if (! Schema::hasColumn('receivable_payments', 'amount')) {
                    $table->decimal('amount', 15, 4);
                }
                if (! Schema::hasColumn('receivable_payments', 'paid_at')) {
                    $table->date('paid_at');
                }
                if (! Schema::hasColumn('receivable_payments', 'note')) {
                    $table->text('note')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Columns added for compatibility are intentionally not dropped.
    }
};
