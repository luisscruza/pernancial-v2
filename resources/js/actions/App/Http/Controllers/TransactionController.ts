import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TransactionController::store
* @see app/Http/Controllers/TransactionController.php:21
* @route '/accounts/{account}/transactions'
*/
export const store = (args: { account: string | { uuid: string } } | [account: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/accounts/{account}/transactions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TransactionController::store
* @see app/Http/Controllers/TransactionController.php:21
* @route '/accounts/{account}/transactions'
*/
store.url = (args: { account: string | { uuid: string } } | [account: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { account: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { account: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            account: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        account: typeof args.account === 'object'
        ? args.account.uuid
        : args.account,
    }

    return store.definition.url
            .replace('{account}', parsedArgs.account.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransactionController::store
* @see app/Http/Controllers/TransactionController.php:21
* @route '/accounts/{account}/transactions'
*/
store.post = (args: { account: string | { uuid: string } } | [account: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TransactionController::update
* @see app/Http/Controllers/TransactionController.php:36
* @route '/accounts/{account}/transactions/{transaction}'
*/
export const update = (args: { account: string | { uuid: string }, transaction: number | { id: number } } | [account: string | { uuid: string }, transaction: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/accounts/{account}/transactions/{transaction}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TransactionController::update
* @see app/Http/Controllers/TransactionController.php:36
* @route '/accounts/{account}/transactions/{transaction}'
*/
update.url = (args: { account: string | { uuid: string }, transaction: number | { id: number } } | [account: string | { uuid: string }, transaction: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            account: args[0],
            transaction: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        account: typeof args.account === 'object'
        ? args.account.uuid
        : args.account,
        transaction: typeof args.transaction === 'object'
        ? args.transaction.id
        : args.transaction,
    }

    return update.definition.url
            .replace('{account}', parsedArgs.account.toString())
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransactionController::update
* @see app/Http/Controllers/TransactionController.php:36
* @route '/accounts/{account}/transactions/{transaction}'
*/
update.put = (args: { account: string | { uuid: string }, transaction: number | { id: number } } | [account: string | { uuid: string }, transaction: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\TransactionController::destroy
* @see app/Http/Controllers/TransactionController.php:52
* @route '/accounts/{account}/transactions/{transaction}'
*/
export const destroy = (args: { account: string | { uuid: string }, transaction: number | { id: number } } | [account: string | { uuid: string }, transaction: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/accounts/{account}/transactions/{transaction}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TransactionController::destroy
* @see app/Http/Controllers/TransactionController.php:52
* @route '/accounts/{account}/transactions/{transaction}'
*/
destroy.url = (args: { account: string | { uuid: string }, transaction: number | { id: number } } | [account: string | { uuid: string }, transaction: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            account: args[0],
            transaction: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        account: typeof args.account === 'object'
        ? args.account.uuid
        : args.account,
        transaction: typeof args.transaction === 'object'
        ? args.transaction.id
        : args.transaction,
    }

    return destroy.definition.url
            .replace('{account}', parsedArgs.account.toString())
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransactionController::destroy
* @see app/Http/Controllers/TransactionController.php:52
* @route '/accounts/{account}/transactions/{transaction}'
*/
destroy.delete = (args: { account: string | { uuid: string }, transaction: number | { id: number } } | [account: string | { uuid: string }, transaction: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const TransactionController = { store, update, destroy }

export default TransactionController