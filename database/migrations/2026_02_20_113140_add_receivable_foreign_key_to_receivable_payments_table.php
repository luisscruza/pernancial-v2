<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        if (! Schema::hasTable('receivable_payments') || ! Schema::hasTable('receivables')) {
            return;
        }

        if ($this->foreignKeyExists('receivable_payments', 'receivable_id', 'receivables', 'receivable_payments_receivable_id_foreign')) {
            return;
        }

        Schema::table('receivable_payments', function (Blueprint $table): void {
            $table->foreign('receivable_id')
                ->references('id')
                ->on('receivables')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        if (! Schema::hasTable('receivable_payments')) {
            return;
        }

        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        if (! $this->foreignKeyExists('receivable_payments', 'receivable_id', 'receivables', 'receivable_payments_receivable_id_foreign')) {
            return;
        }

        Schema::table('receivable_payments', function (Blueprint $table): void {
            $table->dropForeign('receivable_payments_receivable_id_foreign');
        });
    }

    private function foreignKeyExists(
        string $table,
        string $column,
        string $referencedTable,
        string $constraint
    ): bool {
        $connection = DB::connection();
        $driver = $connection->getDriverName();

        if ($driver === 'sqlite') {
            $rows = $connection->select("PRAGMA foreign_key_list($table)");

            foreach ($rows as $row) {
                if ($row->table === $referencedTable && $row->from === $column) {
                    return true;
                }
            }

            return false;
        }

        $database = $connection->getDatabaseName();

        return $connection
            ->table('information_schema.TABLE_CONSTRAINTS')
            ->where('CONSTRAINT_SCHEMA', $database)
            ->where('TABLE_NAME', $table)
            ->where('CONSTRAINT_NAME', $constraint)
            ->exists();
    }
};
