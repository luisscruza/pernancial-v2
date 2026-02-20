import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PayableController::index
* @see app/Http/Controllers/PayableController.php:28
* @route '/payables'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/payables',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayableController::index
* @see app/Http/Controllers/PayableController.php:28
* @route '/payables'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayableController::index
* @see app/Http/Controllers/PayableController.php:28
* @route '/payables'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PayableController::index
* @see app/Http/Controllers/PayableController.php:28
* @route '/payables'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PayableController::create
* @see app/Http/Controllers/PayableController.php:76
* @route '/payables/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/payables/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayableController::create
* @see app/Http/Controllers/PayableController.php:76
* @route '/payables/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayableController::create
* @see app/Http/Controllers/PayableController.php:76
* @route '/payables/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PayableController::create
* @see app/Http/Controllers/PayableController.php:76
* @route '/payables/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PayableController::store
* @see app/Http/Controllers/PayableController.php:92
* @route '/payables'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/payables',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayableController::store
* @see app/Http/Controllers/PayableController.php:92
* @route '/payables'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayableController::store
* @see app/Http/Controllers/PayableController.php:92
* @route '/payables'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PayableController::show
* @see app/Http/Controllers/PayableController.php:142
* @route '/payables/{payable}'
*/
export const show = (args: { payable: number | { id: number } } | [payable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/payables/{payable}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayableController::show
* @see app/Http/Controllers/PayableController.php:142
* @route '/payables/{payable}'
*/
show.url = (args: { payable: number | { id: number } } | [payable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payable: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { payable: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            payable: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payable: typeof args.payable === 'object'
        ? args.payable.id
        : args.payable,
    }

    return show.definition.url
            .replace('{payable}', parsedArgs.payable.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayableController::show
* @see app/Http/Controllers/PayableController.php:142
* @route '/payables/{payable}'
*/
show.get = (args: { payable: number | { id: number } } | [payable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PayableController::show
* @see app/Http/Controllers/PayableController.php:142
* @route '/payables/{payable}'
*/
show.head = (args: { payable: number | { id: number } } | [payable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const PayableController = { index, create, store, show }

export default PayableController