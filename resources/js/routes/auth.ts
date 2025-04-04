import { queryParams, type QueryParams } from './../wayfinder'

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

/**
 * @see routes/auth.php:16
 * @route /auth
 */
export const auth = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: auth.url(options),
    method: 'get',
})

auth.definition = {
    methods: ['get','head'],
    url: '\/auth',
}

/**
 * @see routes/auth.php:16
 * @route /auth
 */
auth.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return auth.definition.url + queryParams(options)
}

/**
 * @see routes/auth.php:16
 * @route /auth
 */
auth.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: auth.url(options),
    method: 'get',
})

/**
 * @see routes/auth.php:16
 * @route /auth
 */
auth.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: auth.url(options),
    method: 'head',
})

const auth = { google, auth }

export default auth