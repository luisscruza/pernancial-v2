<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateCategoryAction;
use App\Actions\UpdateCategoryAction;
use App\Http\Requests\CreateCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
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
    public function show(Category $category): Response
    {
        $transactions = $category->transactions()
            ->with(['account.currency', 'fromAccount.currency', 'destinationAccount.currency'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('categories/show', [
            'category' => $category->only(['id', 'uuid', 'name', 'emoji', 'type']),
            'transactions' => $transactions,
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
