import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GoogleOAuthController::store
* @see app/Http/Controllers/GoogleOAuthController.php:21
* @route '/auth/google'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: store.url(options),
    method: 'get',
})

store.definition = {
    methods: ["get","head"],
    url: '/auth/google',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GoogleOAuthController::store
* @see app/Http/Controllers/GoogleOAuthController.php:21
* @route '/auth/google'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleOAuthController::store
* @see app/Http/Controllers/GoogleOAuthController.php:21
* @route '/auth/google'
*/
store.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: store.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GoogleOAuthController::store
* @see app/Http/Controllers/GoogleOAuthController.php:21
* @route '/auth/google'
*/
store.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: store.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GoogleOAuthController::index
* @see app/Http/Controllers/GoogleOAuthController.php:29
* @route '/auth/google/callback'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/auth/google/callback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GoogleOAuthController::index
* @see app/Http/Controllers/GoogleOAuthController.php:29
* @route '/auth/google/callback'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleOAuthController::index
* @see app/Http/Controllers/GoogleOAuthController.php:29
* @route '/auth/google/callback'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GoogleOAuthController::index
* @see app/Http/Controllers/GoogleOAuthController.php:29
* @route '/auth/google/callback'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const GoogleOAuthController = { store, index }

export default GoogleOAuthController