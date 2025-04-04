import { queryParams, type QueryParams } from './../wayfinder'

/**
 * @see \App\Http\Controllers\AccountController::accounts
 * @see app/Http/Controllers/AccountController.php:17
 * @route //
 */
export const accounts = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: accounts.url(options),
    method: 'get',
})

accounts.definition = {
    methods: ['get','head'],
    url: '\/\/',
}

/**
 * @see \App\Http\Controllers\AccountController::accounts
 * @see app/Http/Controllers/AccountController.php:17
 * @route //
 */
accounts.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return accounts.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\AccountController::accounts
 * @see app/Http/Controllers/AccountController.php:17
 * @route //
 */
accounts.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: accounts.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\AccountController::accounts
 * @see app/Http/Controllers/AccountController.php:17
 * @route //
 */
accounts.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: accounts.url(options),
    method: 'head',
})

