import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FinanceChatDestroyController::__invoke
* @see app/Http/Controllers/FinanceChatDestroyController.php:18
* @route '/finance/chat/{conversation}'
*/
const FinanceChatDestroyController = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: FinanceChatDestroyController.url(args, options),
    method: 'delete',
})

FinanceChatDestroyController.definition = {
    methods: ["delete"],
    url: '/finance/chat/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\FinanceChatDestroyController::__invoke
* @see app/Http/Controllers/FinanceChatDestroyController.php:18
* @route '/finance/chat/{conversation}'
*/
FinanceChatDestroyController.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: args.conversation,
    }

    return FinanceChatDestroyController.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatDestroyController::__invoke
* @see app/Http/Controllers/FinanceChatDestroyController.php:18
* @route '/finance/chat/{conversation}'
*/
FinanceChatDestroyController.delete = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: FinanceChatDestroyController.url(args, options),
    method: 'delete',
})

export default FinanceChatDestroyController