import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import chatB2e4da from './chat'
/**
* @see \App\Http\Controllers\FinanceChatController::chat
* @see app/Http/Controllers/FinanceChatController.php:26
* @route '/finance/chat'
*/
export const chat = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chat.url(options),
    method: 'get',
})

chat.definition = {
    methods: ["get","head"],
    url: '/finance/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FinanceChatController::chat
* @see app/Http/Controllers/FinanceChatController.php:26
* @route '/finance/chat'
*/
chat.url = (options?: RouteQueryOptions) => {
    return chat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceChatController::chat
* @see app/Http/Controllers/FinanceChatController.php:26
* @route '/finance/chat'
*/
chat.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chat.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FinanceChatController::chat
* @see app/Http/Controllers/FinanceChatController.php:26
* @route '/finance/chat'
*/
chat.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: chat.url(options),
    method: 'head',
})

const finance = {
    chat: Object.assign(chat, chatB2e4da),
}

export default finance