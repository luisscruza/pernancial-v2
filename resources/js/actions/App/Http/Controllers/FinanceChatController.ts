import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FinanceChatController::index
* @see app/Http/Controllers/FinanceChatController.php:20
* @route '/finance/chat'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/finance/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FinanceChatController::index
* @see app/Http/Controllers/FinanceChatController.php:20
* @route '/finance/chat'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatController::index
* @see app/Http/Controllers/FinanceChatController.php:20
* @route '/finance/chat'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FinanceChatController::index
* @see app/Http/Controllers/FinanceChatController.php:20
* @route '/finance/chat'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const FinanceChatController = { index }

export default FinanceChatController