import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ReceivablePaymentController::store
* @see app/Http/Controllers/ReceivablePaymentController.php:17
* @route '/receivables/{receivable}/payments'
*/
export const store = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/receivables/{receivable}/payments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ReceivablePaymentController::store
* @see app/Http/Controllers/ReceivablePaymentController.php:17
* @route '/receivables/{receivable}/payments'
*/
store.url = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { receivable: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { receivable: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            receivable: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        receivable: typeof args.receivable === 'object'
        ? args.receivable.id
        : args.receivable,
    }

    return store.definition.url
            .replace('{receivable}', parsedArgs.receivable.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivablePaymentController::store
* @see app/Http/Controllers/ReceivablePaymentController.php:17
* @route '/receivables/{receivable}/payments'
*/
store.post = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const payments = {
    store: Object.assign(store, store),
}

export default payments