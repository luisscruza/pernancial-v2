import { queryParams, type QueryParams } from './../../../../wayfinder'

/**
 * @see \App\Http\Controllers\GoogleOAuthController::store
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route /auth/google
 */
export const store = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: store.url(options),
    method: 'get',
})

store.definition = {
    methods: ['get','head'],
    url: '\/auth\/google',
}

/**
 * @see \App\Http\Controllers\GoogleOAuthController::store
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route /auth/google
 */
store.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return store.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\GoogleOAuthController::store
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route /auth/google
 */
store.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: store.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\GoogleOAuthController::store
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route /auth/google
 */
store.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: store.url(options),
    method: 'head',
})

/**
 * @see \App\Http\Controllers\GoogleOAuthController::index
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route /auth/google/callback
 */
export const index = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ['get','head'],
    url: '\/auth\/google\/callback',
}

/**
 * @see \App\Http\Controllers\GoogleOAuthController::index
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route /auth/google/callback
 */
index.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\GoogleOAuthController::index
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route /auth/google/callback
 */
index.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: index.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\GoogleOAuthController::index
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route /auth/google/callback
 */
index.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: index.url(options),
    method: 'head',
})

const GoogleOAuthController = { store, index }

export default GoogleOAuthController