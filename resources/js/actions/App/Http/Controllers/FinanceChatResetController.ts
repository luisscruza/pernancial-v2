import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FinanceChatResetController::__invoke
* @see app/Http/Controllers/FinanceChatResetController.php:17
* @route '/finance/chat/reset'
*/
const FinanceChatResetController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: FinanceChatResetController.url(options),
    method: 'post',
})

FinanceChatResetController.definition = {
    methods: ["post"],
    url: '/finance/chat/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FinanceChatResetController::__invoke
* @see app/Http/Controllers/FinanceChatResetController.php:17
* @route '/finance/chat/reset'
*/
FinanceChatResetController.url = (options?: RouteQueryOptions) => {
    return FinanceChatResetController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatResetController::__invoke
* @see app/Http/Controllers/FinanceChatResetController.php:17
* @route '/finance/chat/reset'
*/
FinanceChatResetController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: FinanceChatResetController.url(options),
    method: 'post',
})

export default FinanceChatResetController