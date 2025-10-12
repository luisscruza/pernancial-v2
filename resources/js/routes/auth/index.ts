import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\GoogleOAuthController::google
* @see app/Http/Controllers/GoogleOAuthController.php:21
* @route '/auth/google'
*/
export const google = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: google.url(options),
    method: 'get',
})

google.definition = {
    methods: ["get","head"],
    url: '/auth/google',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GoogleOAuthController::google
* @see app/Http/Controllers/GoogleOAuthController.php:21
* @route '/auth/google'
*/
google.url = (options?: RouteQueryOptions) => {
    return google.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleOAuthController::google
* @see app/Http/Controllers/GoogleOAuthController.php:21
* @route '/auth/google'
*/
google.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: google.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GoogleOAuthController::google
* @see app/Http/Controllers/GoogleOAuthController.php:21
* @route '/auth/google'
*/
google.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: google.url(options),
    method: 'head',
})

