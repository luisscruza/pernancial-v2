import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TransactionController::store
* @see app/Http/Controllers/TransactionController.php:17
* @route '/accounts/{account}/transactions'
*/
export const store = (args: { account: string | { uuid: string } } | [account: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/accounts/{account}/transactions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TransactionController::store
* @see app/Http/Controllers/TransactionController.php:17
* @route '/accounts/{account}/transactions'
*/
store.url = (args: { account: string | { uuid: string } } | [account: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { account: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { account: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            account: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        account: typeof args.account === 'object'
        ? args.account.uuid
        : args.account,
    }

    return store.definition.url
            .replace('{account}', parsedArgs.account.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransactionController::store
* @see app/Http/Controllers/TransactionController.php:17
* @route '/accounts/{account}/transactions'
*/
store.post = (args: { account: string | { uuid: string } } | [account: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const TransactionController = { store }

export default TransactionController