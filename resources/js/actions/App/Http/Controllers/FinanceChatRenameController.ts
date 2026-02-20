import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FinanceChatRenameController::__invoke
* @see app/Http/Controllers/FinanceChatRenameController.php:18
* @route '/finance/chat/{conversation}'
*/
const FinanceChatRenameController = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: FinanceChatRenameController.url(args, options),
    method: 'patch',
})

FinanceChatRenameController.definition = {
    methods: ["patch"],
    url: '/finance/chat/{conversation}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\FinanceChatRenameController::__invoke
* @see app/Http/Controllers/FinanceChatRenameController.php:18
* @route '/finance/chat/{conversation}'
*/
FinanceChatRenameController.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return FinanceChatRenameController.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatRenameController::__invoke
* @see app/Http/Controllers/FinanceChatRenameController.php:18
* @route '/finance/chat/{conversation}'
*/
FinanceChatRenameController.patch = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: FinanceChatRenameController.url(args, options),
    method: 'patch',
})

export default FinanceChatRenameController