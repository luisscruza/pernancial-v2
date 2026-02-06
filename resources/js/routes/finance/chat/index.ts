import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\FinanceChatController::stream
* @see app/Http/Controllers/FinanceChatController.php:63
* @route '/finance/chat/stream'
*/
export const stream = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(options),
    method: 'post',
})

stream.definition = {
    methods: ["post"],
    url: '/finance/chat/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FinanceChatController::stream
* @see app/Http/Controllers/FinanceChatController.php:63
* @route '/finance/chat/stream'
*/
stream.url = (options?: RouteQueryOptions) => {
    return stream.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatController::stream
* @see app/Http/Controllers/FinanceChatController.php:63
* @route '/finance/chat/stream'
*/
stream.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FinanceChatController::reset
* @see app/Http/Controllers/FinanceChatController.php:141
* @route '/finance/chat/reset'
*/
export const reset = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(options),
    method: 'post',
})

reset.definition = {
    methods: ["post"],
    url: '/finance/chat/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FinanceChatController::reset
* @see app/Http/Controllers/FinanceChatController.php:141
* @route '/finance/chat/reset'
*/
reset.url = (options?: RouteQueryOptions) => {
    return reset.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatController::reset
* @see app/Http/Controllers/FinanceChatController.php:141
* @route '/finance/chat/reset'
*/
reset.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FinanceChatController::rename
* @see app/Http/Controllers/FinanceChatController.php:148
* @route '/finance/chat/{conversation}'
*/
export const rename = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: rename.url(args, options),
    method: 'patch',
})

rename.definition = {
    methods: ["patch"],
    url: '/finance/chat/{conversation}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\FinanceChatController::rename
* @see app/Http/Controllers/FinanceChatController.php:148
* @route '/finance/chat/{conversation}'
*/
rename.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return rename.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatController::rename
* @see app/Http/Controllers/FinanceChatController.php:148
* @route '/finance/chat/{conversation}'
*/
rename.patch = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: rename.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\FinanceChatController::destroy
* @see app/Http/Controllers/FinanceChatController.php:173
* @route '/finance/chat/{conversation}'
*/
export const destroy = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/finance/chat/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\FinanceChatController::destroy
* @see app/Http/Controllers/FinanceChatController.php:173
* @route '/finance/chat/{conversation}'
*/
destroy.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatController::destroy
* @see app/Http/Controllers/FinanceChatController.php:173
* @route '/finance/chat/{conversation}'
*/
destroy.delete = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const chat = {
    stream: Object.assign(stream, stream),
    reset: Object.assign(reset, reset),
    rename: Object.assign(rename, rename),
    destroy: Object.assign(destroy, destroy),
}

export default chat