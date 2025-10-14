<?php

declare(strict_types=1);

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
        Schema::create('currencies', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(User::class);
            $table->string('code', 3);
            $table->string('name');
            $table->string('symbol', 10);
            $table->integer('decimal_places');
            $table->string('decimal_separator', 10);
            $table->string('thousands_separator', 10);
            $table->string('symbol_position', 10);
            $table->decimal('conversion_rate', 20, 10);
            $table->boolean('is_base');
            $table->timestamps();

            $table->unique(['user_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
