import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CurrencyRateController::store
* @see app/Http/Controllers/CurrencyRateController.php:15
* @route '/currencies/{currency}/rates'
*/
export const store = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/currencies/{currency}/rates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CurrencyRateController::store
* @see app/Http/Controllers/CurrencyRateController.php:15
* @route '/currencies/{currency}/rates'
*/
store.url = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { currency: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { currency: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            currency: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        currency: typeof args.currency === 'object'
        ? args.currency.id
        : args.currency,
    }

    return store.definition.url
            .replace('{currency}', parsedArgs.currency.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyRateController::store
* @see app/Http/Controllers/CurrencyRateController.php:15
* @route '/currencies/{currency}/rates'
*/
store.post = (args: { currency: number | { id: number } } | [currency: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const CurrencyRateController = { store }

export default CurrencyRateController