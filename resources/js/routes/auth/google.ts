import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route /auth/google/callback
 */
export const callback = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: callback.url(options),
    method: 'get',
})

callback.definition = {
    methods: ['get','head'],
    url: '\/auth\/google\/callback',
}

/**
 * @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route /auth/google/callback
 */
callback.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return callback.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route /auth/google/callback
 */
callback.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: callback.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route /auth/google/callback
 */
callback.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: callback.url(options),
    method: 'head',
})

const google = { callback }

export default google