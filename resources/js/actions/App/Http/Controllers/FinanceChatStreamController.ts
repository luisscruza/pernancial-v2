import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FinanceChatStreamController::__invoke
* @see app/Http/Controllers/FinanceChatStreamController.php:23
* @route '/finance/chat/stream'
*/
const FinanceChatStreamController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: FinanceChatStreamController.url(options),
    method: 'post',
})

FinanceChatStreamController.definition = {
    methods: ["post"],
    url: '/finance/chat/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FinanceChatStreamController::__invoke
* @see app/Http/Controllers/FinanceChatStreamController.php:23
* @route '/finance/chat/stream'
*/
FinanceChatStreamController.url = (options?: RouteQueryOptions) => {
    return FinanceChatStreamController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatStreamController::__invoke
* @see app/Http/Controllers/FinanceChatStreamController.php:23
* @route '/finance/chat/stream'
*/
FinanceChatStreamController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: FinanceChatStreamController.url(options),
    method: 'post',
})

export default FinanceChatStreamController