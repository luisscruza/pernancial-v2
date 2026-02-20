<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateCategoryAction;
use App\Actions\UpdateCategoryAction;
use App\Http\Requests\CreateCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CategoryController
{
    /**
     * Display a listing of the user's categories.
     */
    public function index(#[CurrentUser] User $user): Response
    {
        $categories = $user->categories()
            ->orderBy('type')
            ->orderBy('name')
            ->get(['id', 'uuid', 'name', 'emoji', 'type']);

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        return Inertia::render('categories/create');
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(
        CreateCategoryRequest $request,
        CreateCategoryAction $createCategoryAction,
        #[CurrentUser] User $user
    ): RedirectResponse {
        /** @var array{name: string, emoji: string, type: string} $data */
        $data = $request->validated();

        $createCategoryAction->handle($user, $data);

        return to_route('categories')->with('success', 'Categoría creada exitosamente.');
    }

    /**
     * Display the specified category with its transactions.
     */
    public function show(Request $request, Category $category): Response
    {
        $dateFrom = $request->string('date_from')->toString();
        $dateTo = $request->string('date_to')->toString();
        $accountId = $request->string('account_id')->toString();

        $transactionsQuery = Transaction::query()
            ->whereHas('account', fn ($query) => $query->where('user_id', $category->user_id))
            ->where(function ($query) use ($category): void {
                $query->where('category_id', $category->id)
                    ->orWhereHas('splits', fn ($splitQuery) => $splitQuery->where('category_id', $category->id));
            })
            ->with(['account.currency', 'fromAccount.currency', 'destinationAccount.currency', 'splits.category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Apply date filters if provided
        if ($dateFrom) {
            $transactionsQuery->whereDate('transaction_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $transactionsQuery->whereDate('transaction_date', '<=', $dateTo);
        }

        // Apply account filter if provided
        if ($accountId) {
            $transactionsQuery->where('account_id', $accountId);
        }

        return Inertia::render('categories/show', [
            'category' => $category->only(['id', 'uuid', 'name', 'emoji', 'type']),
            'transactions' => $transactionsQuery->paginate(20),
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'account_id' => $accountId,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('categories/edit', [
            'category' => $category->only(['id', 'uuid', 'name', 'emoji', 'type']),
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(
        UpdateCategoryRequest $request,
        Category $category,
        UpdateCategoryAction $updateCategoryAction
    ): RedirectResponse {
        /** @var array{name: string, emoji: string, type: string} $data */
        $data = $request->validated();

        $updateCategoryAction->handle($category, $data);

        return to_route('categories.show', $category)->with('success', 'Categoría actualizada exitosamente.');
    }
}
