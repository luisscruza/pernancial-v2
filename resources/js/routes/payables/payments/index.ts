import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PayablePaymentController::store
* @see app/Http/Controllers/PayablePaymentController.php:17
* @route '/payables/{payable}/payments'
*/
export const store = (args: { payable: number | { id: number } } | [payable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/payables/{payable}/payments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayablePaymentController::store
* @see app/Http/Controllers/PayablePaymentController.php:17
* @route '/payables/{payable}/payments'
*/
store.url = (args: { payable: number | { id: number } } | [payable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payable: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { payable: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            payable: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payable: typeof args.payable === 'object'
        ? args.payable.id
        : args.payable,
    }

    return store.definition.url
            .replace('{payable}', parsedArgs.payable.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayablePaymentController::store
* @see app/Http/Controllers/PayablePaymentController.php:17
* @route '/payables/{payable}/payments'
*/
store.post = (args: { payable: number | { id: number } } | [payable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const payments = {
    store: Object.assign(store, store),
}

export default payments