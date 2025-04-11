import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see \App\Http\Controllers\AccountController::show
 * @see app/Http/Controllers/AccountController.php:32
 * @route /accounts/{account}
 */
export const show = (args: { account: number | { id: number } } | [account: number | { id: number }] | number | { id: number }, options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ['get','head'],
    url: '\/accounts\/{account}',
}

/**
 * @see \App\Http\Controllers\AccountController::show
 * @see app/Http/Controllers/AccountController.php:32
 * @route /accounts/{account}
 */
show.url = (args: { account: number | { id: number } } | [account: number | { id: number }] | number | { id: number }, options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
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
 * @see app/Http/Controllers/AccountController.php:32
 * @route /accounts/{account}
 */
show.get = (args: { account: number | { id: number } } | [account: number | { id: number }] | number | { id: number }, options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: show.url(args, options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\AccountController::show
 * @see app/Http/Controllers/AccountController.php:32
 * @route /accounts/{account}
 */
show.head = (args: { account: number | { id: number } } | [account: number | { id: number }] | number | { id: number }, options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: show.url(args, options),
    method: 'head',
})

export default show