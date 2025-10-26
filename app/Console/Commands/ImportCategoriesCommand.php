<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Category;
use Illuminate\Console\Command;

final class ImportCategoriesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'categories:import';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $categories = [
            [
                'type' => 'expense',
                'name' => 'Agua',
                'emoji' => '💧',
            ],
            [
                'type' => 'expense',
                'name' => 'Gas',
                'emoji' => '🔥',
            ],
        ];

        // full list converted from comments
        $categories = array_merge($categories, [
            ['type' => 'expense', 'name' => 'Luz', 'emoji' => '💡'],
            ['type' => 'expense', 'name' => 'Renta', 'emoji' => '🏠'],
            ['type' => 'expense', 'name' => 'Plaza de garaje', 'emoji' => '🅿️'],
            ['type' => 'expense', 'name' => 'Internet', 'emoji' => '🌐'],
            ['type' => 'expense', 'name' => 'Otros gastos de la casa', 'emoji' => '🏡'],
            ['type' => 'expense', 'name' => 'Supermercado', 'emoji' => '🛒'],
            ['type' => 'expense', 'name' => 'Comida fuera', 'emoji' => '🍽️'],
            ['type' => 'expense', 'name' => 'Dates', 'emoji' => '❤️'],
            ['type' => 'expense', 'name' => 'Alcohol', 'emoji' => '🍺'],
            ['type' => 'expense', 'name' => 'Peluquería', 'emoji' => '✂️'],
            ['type' => 'expense', 'name' => 'Gimnasio', 'emoji' => '🏋️'],
            ['type' => 'expense', 'name' => 'Gasolina', 'emoji' => '⛽'],
            ['type' => 'expense', 'name' => 'Otros gastos coche', 'emoji' => '🚗'],
            ['type' => 'expense', 'name' => 'Transporte público', 'emoji' => '🚌'],
            ['type' => 'expense', 'name' => 'Psicólogo', 'emoji' => '🧠'],
            ['type' => 'expense', 'name' => 'Farmacia', 'emoji' => '💊'],
            ['type' => 'expense', 'name' => 'Dentista', 'emoji' => '🦷'],
            ['type' => 'expense', 'name' => 'Hugo', 'emoji' => '👤'],
            ['type' => 'expense', 'name' => 'Impuestos', 'emoji' => '🧾'],
            ['type' => 'expense', 'name' => 'Sueldos', 'emoji' => '💰'],
            ['type' => 'expense', 'name' => 'Gastos en clientes', 'emoji' => '🤝'],
            ['type' => 'expense', 'name' => 'Software - suscripciones', 'emoji' => '💻'],
            ['type' => 'expense', 'name' => 'Presupuesto Luis', 'emoji' => '📊'],
            ['type' => 'expense', 'name' => 'Presupuesto Rebe', 'emoji' => '📊'],
            ['type' => 'expense', 'name' => 'Otros', 'emoji' => '🔁'],
            ['type' => 'expense', 'name' => 'Servicios de internet', 'emoji' => '📡'],
            ['type' => 'expense', 'name' => 'Regalos', 'emoji' => '🎁'],
            ['type' => 'expense', 'name' => 'Ahorros', 'emoji' => '🏦'],
            ['type' => 'expense', 'name' => 'Vacaciones', 'emoji' => '🏖️'],
            ['type' => 'expense', 'name' => 'Vuelos', 'emoji' => '✈️'],
            ['type' => 'expense', 'name' => 'Coche', 'emoji' => '🚗'],
            ['type' => 'expense', 'name' => 'Carnet de Conducir', 'emoji' => '🪪'],
            ['type' => 'income', 'name' => 'Salario', 'emoji' => '💸'],
            ['type' => 'income', 'name' => 'Otros ingresos', 'emoji' => '💵'],
            ['type' => 'income', 'name' => 'Salario Luis', 'emoji' => '💸'],
            ['type' => 'income', 'name' => 'Salario Rebe 112', 'emoji' => '💸'],
            ['type' => 'income', 'name' => 'Facturacion clientes RD', 'emoji' => '📄'],
            ['type' => 'expense', 'name' => 'Gestoría', 'emoji' => '📑'],
            ['type' => 'expense', 'name' => 'Cuota de autónomo', 'emoji' => '🧾'],
            ['type' => 'expense', 'name' => 'Otros gastos RD', 'emoji' => '🔁'],
            ['type' => 'expense', 'name' => 'SaaS Maintenance', 'emoji' => '☁️'],
            ['type' => 'expense', 'name' => 'Cruz Media', 'emoji' => '💻'],

        ]);

        foreach ($categories as $category) {
            Category::firstOrCreate(['user_id' => 1, 'name' => $category['name']], ['type' => $category['type'], 'emoji' => $category['emoji']]);
        }

        $this->info('Imported '.count($categories).' categories');
    }
}
