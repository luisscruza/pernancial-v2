import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\BudgetPeriodController::index
* @see app/Http/Controllers/BudgetPeriodController.php:27
* @route '/budgets'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/budgets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BudgetPeriodController::index
* @see app/Http/Controllers/BudgetPeriodController.php:27
* @route '/budgets'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetPeriodController::index
* @see app/Http/Controllers/BudgetPeriodController.php:27
* @route '/budgets'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::index
* @see app/Http/Controllers/BudgetPeriodController.php:27
* @route '/budgets'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BudgetController::create
* @see app/Http/Controllers/BudgetController.php:37
* @route '/budgets/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/budgets/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BudgetController::create
* @see app/Http/Controllers/BudgetController.php:37
* @route '/budgets/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetController::create
* @see app/Http/Controllers/BudgetController.php:37
* @route '/budgets/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BudgetController::create
* @see app/Http/Controllers/BudgetController.php:37
* @route '/budgets/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BudgetController::store
* @see app/Http/Controllers/BudgetController.php:48
* @route '/budgets'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/budgets',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BudgetController::store
* @see app/Http/Controllers/BudgetController.php:48
* @route '/budgets'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetController::store
* @see app/Http/Controllers/BudgetController.php:48
* @route '/budgets'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BudgetController::edit
* @see app/Http/Controllers/BudgetController.php:88
* @route '/budgets/{budget}/edit'
*/
export const edit = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/budgets/{budget}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BudgetController::edit
* @see app/Http/Controllers/BudgetController.php:88
* @route '/budgets/{budget}/edit'
*/
edit.url = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { budget: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            budget: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        budget: typeof args.budget === 'object'
        ? args.budget.id
        : args.budget,
    }

    return edit.definition.url
            .replace('{budget}', parsedArgs.budget.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetController::edit
* @see app/Http/Controllers/BudgetController.php:88
* @route '/budgets/{budget}/edit'
*/
edit.get = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BudgetController::edit
* @see app/Http/Controllers/BudgetController.php:88
* @route '/budgets/{budget}/edit'
*/
edit.head = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BudgetController::show
* @see app/Http/Controllers/BudgetController.php:64
* @route '/budgets/{budget}'
*/
export const show = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/budgets/{budget}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BudgetController::show
* @see app/Http/Controllers/BudgetController.php:64
* @route '/budgets/{budget}'
*/
show.url = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { budget: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            budget: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        budget: typeof args.budget === 'object'
        ? args.budget.id
        : args.budget,
    }

    return show.definition.url
            .replace('{budget}', parsedArgs.budget.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetController::show
* @see app/Http/Controllers/BudgetController.php:64
* @route '/budgets/{budget}'
*/
show.get = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BudgetController::show
* @see app/Http/Controllers/BudgetController.php:64
* @route '/budgets/{budget}'
*/
show.head = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BudgetController::update
* @see app/Http/Controllers/BudgetController.php:102
* @route '/budgets/{budget}'
*/
export const update = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/budgets/{budget}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BudgetController::update
* @see app/Http/Controllers/BudgetController.php:102
* @route '/budgets/{budget}'
*/
update.url = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { budget: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            budget: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        budget: typeof args.budget === 'object'
        ? args.budget.id
        : args.budget,
    }

    return update.definition.url
            .replace('{budget}', parsedArgs.budget.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetController::update
* @see app/Http/Controllers/BudgetController.php:102
* @route '/budgets/{budget}'
*/
update.put = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\BudgetController::destroy
* @see app/Http/Controllers/BudgetController.php:129
* @route '/budgets/{budget}'
*/
export const destroy = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/budgets/{budget}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BudgetController::destroy
* @see app/Http/Controllers/BudgetController.php:129
* @route '/budgets/{budget}'
*/
destroy.url = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budget: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { budget: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            budget: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        budget: typeof args.budget === 'object'
        ? args.budget.id
        : args.budget,
    }

    return destroy.definition.url
            .replace('{budget}', parsedArgs.budget.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetController::destroy
* @see app/Http/Controllers/BudgetController.php:129
* @route '/budgets/{budget}'
*/
destroy.delete = (args: { budget: number | { id: number } } | [budget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const budgets = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    edit: Object.assign(edit, edit),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default budgets