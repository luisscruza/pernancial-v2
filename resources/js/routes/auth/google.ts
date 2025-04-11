import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see \App\Http\Controllers\GoogleOAuthController::google
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route /auth/google
 */
export const google = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: google.url(options),
    method: 'get',
})

google.definition = {
    methods: ['get','head'],
    url: '\/auth\/google',
}

/**
 * @see \App\Http\Controllers\GoogleOAuthController::google
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route /auth/google
 */
google.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return google.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\GoogleOAuthController::google
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route /auth/google
 */
google.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: google.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\GoogleOAuthController::google
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route /auth/google
 */
google.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: google.url(options),
    method: 'head',
})

export default google