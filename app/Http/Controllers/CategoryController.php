<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateCategoryAction;
use App\Http\Requests\CreateCategoryRequest;
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
            ->get(['id', 'name', 'emoji', 'type']);

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
}
