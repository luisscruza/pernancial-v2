<?php

declare(strict_types=1);

use App\Models\Currency;
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
        Schema::create('currency_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class);
            $table->foreignIdFor(Currency::class)->constrained()->cascadeOnDelete();
            $table->decimal('rate', 10, 4);
            $table->datetime('effective_date');
            $table->timestamps();
            $table->unique(['currency_id', 'effective_date', 'user_id']);
            $table->index(['currency_id', 'effective_date', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currency_rates');
    }
};
