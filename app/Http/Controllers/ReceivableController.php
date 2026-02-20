<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateReceivableAction;
use App\Actions\CreateReceivableSeriesAction;
use App\Dto\CreateReceivableDto;
use App\Dto\CreateReceivableSeriesDto;
use App\Enums\CategoryType;
use App\Http\Requests\CreateReceivableRequest;
use App\Models\Category;
use App\Models\Receivable;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ReceivableController
{
    /**
     * Display a listing of receivables.
     */
    public function index(#[CurrentUser] User $user): Response
    {
        $receivables = $user->receivables()
            ->with(['contact', 'currency'])
            ->orderBy('due_date', 'desc')
            ->paginate(20);

        $accounts = $user->accounts()
            ->with('currency')
            ->orderBy('name')
            ->get();

        $categories = $user->categories()
            ->where('type', CategoryType::INCOME)
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'emoji' => $category->emoji,
            ]);

        return Inertia::render('receivables/index', [
            'receivables' => $receivables,
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new receivable.
     */
    public function create(Request $request, #[CurrentUser] User $user): Response
    {
        $contacts = $user->contacts()->orderBy('name')->get();
        $currencies = $user->currencies()->orderBy('name')->get();
        $contactId = $request->integer('contact_id');

        return Inertia::render('receivables/create', [
            'contacts' => $contacts,
            'currencies' => $currencies,
            'contactId' => $contactId ?: null,
        ]);
    }

    /**
     * Store a newly created receivable in storage.
     */
    public function store(
        CreateReceivableRequest $request,
        CreateReceivableAction $createReceivableAction,
        CreateReceivableSeriesAction $createReceivableSeriesAction,
        #[CurrentUser] User $user
    ): RedirectResponse {
        $series = null;

        if ($request->boolean('is_recurring')) {
            $seriesDto = $request->getSeriesDto();

            if ($seriesDto instanceof CreateReceivableSeriesDto) {
                $nextDueDate = $this->calculateNextDueDate(
                    $request->string('due_date')->value(),
                    (int) ($seriesDto->recurrence_rule['day_of_month'] ?? 1),
                );

                $seriesDto = new CreateReceivableSeriesDto(
                    contact: $seriesDto->contact,
                    currency: $seriesDto->currency,
                    name: $seriesDto->name,
                    default_amount: $seriesDto->default_amount,
                    is_recurring: true,
                    recurrence_rule: $seriesDto->recurrence_rule,
                    next_due_date: $nextDueDate,
                );

                $series = $createReceivableSeriesAction->handle($user, $seriesDto);
            }
        }

        $baseDto = $request->getReceivableDto();

        $receivableDto = new CreateReceivableDto(
            contact: $baseDto->contact,
            currency: $baseDto->currency,
            amount_total: $baseDto->amount_total,
            due_date: $baseDto->due_date,
            description: $baseDto->description,
            series: $series,
        );

        $createReceivableAction->handle($user, $receivableDto);

        return to_route('receivables.index')->with('success', 'Cuenta por cobrar creada exitosamente.');
    }

    /**
     * Display the specified receivable.
     */
    public function show(Receivable $receivable, #[CurrentUser] User $user): Response
    {
        $receivable->load(['contact', 'currency', 'payments.account.currency', 'payments.transaction']);
        $accounts = $user->accounts()->with('currency')->orderBy('name')->get();
        $categories = $user->categories()
            ->where('type', CategoryType::INCOME)
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'emoji' => $category->emoji,
            ]);

        return Inertia::render('receivables/show', [
            'receivable' => $receivable,
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    private function calculateNextDueDate(string $dueDate, int $dayOfMonth): string
    {
        $current = Carbon::parse($dueDate);
        $next = $current->copy()->addMonthNoOverflow()->day($dayOfMonth);

        return $next->toDateString();
    }
}
