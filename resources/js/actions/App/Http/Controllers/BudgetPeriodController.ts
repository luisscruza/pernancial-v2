import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BudgetPeriodController::index
* @see app/Http/Controllers/BudgetPeriodController.php:21
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
* @see app/Http/Controllers/BudgetPeriodController.php:21
* @route '/budgets'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetPeriodController::index
* @see app/Http/Controllers/BudgetPeriodController.php:21
* @route '/budgets'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::index
* @see app/Http/Controllers/BudgetPeriodController.php:21
* @route '/budgets'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::create
* @see app/Http/Controllers/BudgetPeriodController.php:91
* @route '/budget-periods/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/budget-periods/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BudgetPeriodController::create
* @see app/Http/Controllers/BudgetPeriodController.php:91
* @route '/budget-periods/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetPeriodController::create
* @see app/Http/Controllers/BudgetPeriodController.php:91
* @route '/budget-periods/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::create
* @see app/Http/Controllers/BudgetPeriodController.php:91
* @route '/budget-periods/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::store
* @see app/Http/Controllers/BudgetPeriodController.php:102
* @route '/budget-periods'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/budget-periods',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BudgetPeriodController::store
* @see app/Http/Controllers/BudgetPeriodController.php:102
* @route '/budget-periods'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetPeriodController::store
* @see app/Http/Controllers/BudgetPeriodController.php:102
* @route '/budget-periods'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::show
* @see app/Http/Controllers/BudgetPeriodController.php:69
* @route '/budget-periods/{budgetPeriod}'
*/
export const show = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/budget-periods/{budgetPeriod}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BudgetPeriodController::show
* @see app/Http/Controllers/BudgetPeriodController.php:69
* @route '/budget-periods/{budgetPeriod}'
*/
show.url = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budgetPeriod: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { budgetPeriod: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            budgetPeriod: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        budgetPeriod: typeof args.budgetPeriod === 'object'
        ? args.budgetPeriod.id
        : args.budgetPeriod,
    }

    return show.definition.url
            .replace('{budgetPeriod}', parsedArgs.budgetPeriod.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetPeriodController::show
* @see app/Http/Controllers/BudgetPeriodController.php:69
* @route '/budget-periods/{budgetPeriod}'
*/
show.get = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::show
* @see app/Http/Controllers/BudgetPeriodController.php:69
* @route '/budget-periods/{budgetPeriod}'
*/
show.head = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::edit
* @see app/Http/Controllers/BudgetPeriodController.php:118
* @route '/budget-periods/{budgetPeriod}/edit'
*/
export const edit = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/budget-periods/{budgetPeriod}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BudgetPeriodController::edit
* @see app/Http/Controllers/BudgetPeriodController.php:118
* @route '/budget-periods/{budgetPeriod}/edit'
*/
edit.url = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budgetPeriod: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { budgetPeriod: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            budgetPeriod: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        budgetPeriod: typeof args.budgetPeriod === 'object'
        ? args.budgetPeriod.id
        : args.budgetPeriod,
    }

    return edit.definition.url
            .replace('{budgetPeriod}', parsedArgs.budgetPeriod.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetPeriodController::edit
* @see app/Http/Controllers/BudgetPeriodController.php:118
* @route '/budget-periods/{budgetPeriod}/edit'
*/
edit.get = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::edit
* @see app/Http/Controllers/BudgetPeriodController.php:118
* @route '/budget-periods/{budgetPeriod}/edit'
*/
edit.head = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BudgetPeriodController::update
* @see app/Http/Controllers/BudgetPeriodController.php:134
* @route '/budget-periods/{budgetPeriod}'
*/
export const update = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/budget-periods/{budgetPeriod}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BudgetPeriodController::update
* @see app/Http/Controllers/BudgetPeriodController.php:134
* @route '/budget-periods/{budgetPeriod}'
*/
update.url = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budgetPeriod: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { budgetPeriod: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            budgetPeriod: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        budgetPeriod: typeof args.budgetPeriod === 'object'
        ? args.budgetPeriod.id
        : args.budgetPeriod,
    }

    return update.definition.url
            .replace('{budgetPeriod}', parsedArgs.budgetPeriod.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetPeriodController::update
* @see app/Http/Controllers/BudgetPeriodController.php:134
* @route '/budget-periods/{budgetPeriod}'
*/
update.put = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

const BudgetPeriodController = { index, create, store, show, edit, update }

export default BudgetPeriodController