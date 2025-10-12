import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AccountController::index
* @see app/Http/Controllers/AccountController.php:28
* @route '/'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AccountController::index
* @see app/Http/Controllers/AccountController.php:28
* @route '/'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccountController::index
* @see app/Http/Controllers/AccountController.php:28
* @route '/'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccountController::index
* @see app/Http/Controllers/AccountController.php:28
* @route '/'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AccountController::create
* @see app/Http/Controllers/AccountController.php:42
* @route '/accounts/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/accounts/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AccountController::create
* @see app/Http/Controllers/AccountController.php:42
* @route '/accounts/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccountController::create
* @see app/Http/Controllers/AccountController.php:42
* @route '/accounts/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccountController::create
* @see app/Http/Controllers/AccountController.php:42
* @route '/accounts/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AccountController::store
* @see app/Http/Controllers/AccountController.php:66
* @route '/accounts'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/accounts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AccountController::store
* @see app/Http/Controllers/AccountController.php:66
* @route '/accounts'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccountController::store
* @see app/Http/Controllers/AccountController.php:66
* @route '/accounts'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccountController::show
* @see app/Http/Controllers/AccountController.php:78
* @route '/accounts/{account}'
*/
export const show = (args: { account: number | { id: number } } | [account: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/accounts/{account}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AccountController::show
* @see app/Http/Controllers/AccountController.php:78
* @route '/accounts/{account}'
*/
show.url = (args: { account: number | { id: number } } | [account: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { account: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { account: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            account: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        account: typeof args.account === 'object'
        ? args.account.id
        : args.account,
    }

    return show.definition.url
            .replace('{account}', parsedArgs.account.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccountController::show
* @see app/Http/Controllers/AccountController.php:78
* @route '/accounts/{account}'
*/
show.get = (args: { account: number | { id: number } } | [account: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccountController::show
* @see app/Http/Controllers/AccountController.php:78
* @route '/accounts/{account}'
*/
show.head = (args: { account: number | { id: number } } | [account: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const AccountController = { index, create, store, show }

export default AccountController