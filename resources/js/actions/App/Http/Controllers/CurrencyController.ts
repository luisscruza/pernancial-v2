import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CurrencyController::index
* @see app/Http/Controllers/CurrencyController.php:22
* @route '/currencies'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/currencies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::index
* @see app/Http/Controllers/CurrencyController.php:22
* @route '/currencies'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::index
* @see app/Http/Controllers/CurrencyController.php:22
* @route '/currencies'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CurrencyController::index
* @see app/Http/Controllers/CurrencyController.php:22
* @route '/currencies'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::create
* @see app/Http/Controllers/CurrencyController.php:36
* @route '/currencies/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/currencies/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::create
* @see app/Http/Controllers/CurrencyController.php:36
* @route '/currencies/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::create
* @see app/Http/Controllers/CurrencyController.php:36
* @route '/currencies/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CurrencyController::create
* @see app/Http/Controllers/CurrencyController.php:36
* @route '/currencies/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::store
* @see app/Http/Controllers/CurrencyController.php:41
* @route '/currencies'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/currencies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CurrencyController::store
* @see app/Http/Controllers/CurrencyController.php:41
* @route '/currencies'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::store
* @see app/Http/Controllers/CurrencyController.php:41
* @route '/currencies'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CurrencyController::show
* @see app/Http/Controllers/CurrencyController.php:54
* @route '/currencies/{currency}'
*/
export const show = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/currencies/{currency}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::show
* @see app/Http/Controllers/CurrencyController.php:54
* @route '/currencies/{currency}'
*/
show.url = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { currency: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { currency: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            currency: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        currency: typeof args.currency === 'object'
        ? args.currency.id
        : args.currency,
    }

    return show.definition.url
            .replace('{currency}', parsedArgs.currency.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::show
* @see app/Http/Controllers/CurrencyController.php:54
* @route '/currencies/{currency}'
*/
show.get = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CurrencyController::show
* @see app/Http/Controllers/CurrencyController.php:54
* @route '/currencies/{currency}'
*/
show.head = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::edit
* @see app/Http/Controllers/CurrencyController.php:65
* @route '/currencies/{currency}/edit'
*/
export const edit = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/currencies/{currency}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::edit
* @see app/Http/Controllers/CurrencyController.php:65
* @route '/currencies/{currency}/edit'
*/
edit.url = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { currency: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { currency: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            currency: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        currency: typeof args.currency === 'object'
        ? args.currency.id
        : args.currency,
    }

    return edit.definition.url
            .replace('{currency}', parsedArgs.currency.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::edit
* @see app/Http/Controllers/CurrencyController.php:65
* @route '/currencies/{currency}/edit'
*/
edit.get = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CurrencyController::edit
* @see app/Http/Controllers/CurrencyController.php:65
* @route '/currencies/{currency}/edit'
*/
edit.head = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::update
* @see app/Http/Controllers/CurrencyController.php:72
* @route '/currencies/{currency}'
*/
export const update = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/currencies/{currency}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\CurrencyController::update
* @see app/Http/Controllers/CurrencyController.php:72
* @route '/currencies/{currency}'
*/
update.url = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { currency: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { currency: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            currency: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        currency: typeof args.currency === 'object'
        ? args.currency.id
        : args.currency,
    }

    return update.definition.url
            .replace('{currency}', parsedArgs.currency.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::update
* @see app/Http/Controllers/CurrencyController.php:72
* @route '/currencies/{currency}'
*/
update.put = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

const CurrencyController = { index, create, store, show, edit, update }

export default CurrencyController