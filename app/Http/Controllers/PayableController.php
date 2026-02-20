<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreatePayableAction;
use App\Actions\CreatePayableSeriesAction;
use App\Dto\CreatePayableDto;
use App\Dto\CreatePayableSeriesDto;
use App\Enums\CategoryType;
use App\Http\Requests\CreatePayableRequest;
use App\Models\Category;
use App\Models\Payable;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PayableController
{
    /**
     * Display a listing of payables.
     */
    public function index(Request $request, #[CurrentUser] User $user): Response
    {
        $contactId = $request->integer('contact_id');
        $status = $request->string('status')->toString();
        $statusFilter = $status !== '' ? $status : 'unpaid';

        $payables = $user->payables()
            ->with(['contact', 'currency'])
            ->when($contactId, fn ($query) => $query->where('contact_id', $contactId))
            ->when($statusFilter === 'paid', fn ($query) => $query->where('status', 'paid'))
            ->when($statusFilter === 'unpaid', fn ($query) => $query->whereIn('status', ['open', 'partial']))
            ->orderBy('due_date', 'desc')
            ->paginate(20)
            ->withQueryString();

        $accounts = $user->accounts()
            ->with('currency')
            ->orderBy('name')
            ->get();

        $categories = $user->categories()
            ->where('type', CategoryType::EXPENSE)
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'emoji' => $category->emoji,
            ]);

        $contacts = $user->contacts()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('payables/index', [
            'payables' => $payables,
            'accounts' => $accounts,
            'categories' => $categories,
            'contacts' => $contacts,
            'filters' => [
                'contact_id' => $contactId ?: null,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Show the form for creating a new payable.
     */
    public function create(Request $request, #[CurrentUser] User $user): Response
    {
        $contacts = $user->contacts()->orderBy('name')->get();
        $currencies = $user->currencies()->orderBy('name')->get();
        $contactId = $request->integer('contact_id');

        return Inertia::render('payables/create', [
            'contacts' => $contacts,
            'currencies' => $currencies,
            'contactId' => $contactId ?: null,
        ]);
    }

    /**
     * Store a newly created payable in storage.
     */
    public function store(
        CreatePayableRequest $request,
        CreatePayableAction $createPayableAction,
        CreatePayableSeriesAction $createPayableSeriesAction,
        #[CurrentUser] User $user
    ): RedirectResponse {
        $series = null;

        if ($request->boolean('is_recurring')) {
            $seriesDto = $request->getSeriesDto();

            if ($seriesDto instanceof CreatePayableSeriesDto) {
                $nextDueDate = $this->calculateNextDueDate(
                    $request->string('due_date')->value(),
                    (int) ($seriesDto->recurrence_rule['day_of_month'] ?? 1),
                );

                $seriesDto = new CreatePayableSeriesDto(
                    contact: $seriesDto->contact,
                    currency: $seriesDto->currency,
                    name: $seriesDto->name,
                    default_amount: $seriesDto->default_amount,
                    is_recurring: true,
                    recurrence_rule: $seriesDto->recurrence_rule,
                    next_due_date: $nextDueDate,
                );

                $series = $createPayableSeriesAction->handle($user, $seriesDto);
            }
        }

        $baseDto = $request->getPayableDto();

        $payableDto = new CreatePayableDto(
            contact: $baseDto->contact,
            currency: $baseDto->currency,
            amount_total: $baseDto->amount_total,
            due_date: $baseDto->due_date,
            description: $baseDto->description,
            series: $series,
        );

        $createPayableAction->handle($user, $payableDto);

        return to_route('payables.index')->with('success', 'Cuenta por pagar creada exitosamente.');
    }

    /**
     * Display the specified payable.
     */
    public function show(Payable $payable, #[CurrentUser] User $user): Response
    {
        $payable->load(['contact', 'currency', 'payments.account.currency', 'payments.transaction']);
        $accounts = $user->accounts()->with('currency')->orderBy('name')->get();
        $categories = $user->categories()
            ->where('type', CategoryType::EXPENSE)
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'emoji' => $category->emoji,
            ]);

        return Inertia::render('payables/show', [
            'payable' => $payable,
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
