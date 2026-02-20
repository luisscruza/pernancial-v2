import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ReceivableController::index
* @see app/Http/Controllers/ReceivableController.php:28
* @route '/receivables'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/receivables',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReceivableController::index
* @see app/Http/Controllers/ReceivableController.php:28
* @route '/receivables'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::index
* @see app/Http/Controllers/ReceivableController.php:28
* @route '/receivables'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReceivableController::index
* @see app/Http/Controllers/ReceivableController.php:28
* @route '/receivables'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReceivableController::create
* @see app/Http/Controllers/ReceivableController.php:128
* @route '/receivables/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/receivables/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReceivableController::create
* @see app/Http/Controllers/ReceivableController.php:128
* @route '/receivables/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::create
* @see app/Http/Controllers/ReceivableController.php:128
* @route '/receivables/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReceivableController::create
* @see app/Http/Controllers/ReceivableController.php:128
* @route '/receivables/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReceivableController::store
* @see app/Http/Controllers/ReceivableController.php:144
* @route '/receivables'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/receivables',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ReceivableController::store
* @see app/Http/Controllers/ReceivableController.php:144
* @route '/receivables'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::store
* @see app/Http/Controllers/ReceivableController.php:144
* @route '/receivables'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ReceivableController::show
* @see app/Http/Controllers/ReceivableController.php:194
* @route '/receivables/{receivable}'
*/
export const show = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/receivables/{receivable}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReceivableController::show
* @see app/Http/Controllers/ReceivableController.php:194
* @route '/receivables/{receivable}'
*/
show.url = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { receivable: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { receivable: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            receivable: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        receivable: typeof args.receivable === 'object'
        ? args.receivable.id
        : args.receivable,
    }

    return show.definition.url
            .replace('{receivable}', parsedArgs.receivable.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::show
* @see app/Http/Controllers/ReceivableController.php:194
* @route '/receivables/{receivable}'
*/
show.get = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReceivableController::show
* @see app/Http/Controllers/ReceivableController.php:194
* @route '/receivables/{receivable}'
*/
show.head = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const ReceivableController = { index, create, store, show }

export default ReceivableController