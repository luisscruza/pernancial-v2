import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import payments from './payments'
/**
* @see \App\Http\Controllers\ReceivableController::index
* @see app/Http/Controllers/ReceivableController.php:30
* @route '/receivables'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/receivables',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReceivableController::index
* @see app/Http/Controllers/ReceivableController.php:30
* @route '/receivables'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::index
* @see app/Http/Controllers/ReceivableController.php:30
* @route '/receivables'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReceivableController::index
* @see app/Http/Controllers/ReceivableController.php:30
* @route '/receivables'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReceivableController::create
* @see app/Http/Controllers/ReceivableController.php:130
* @route '/receivables/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/receivables/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReceivableController::create
* @see app/Http/Controllers/ReceivableController.php:130
* @route '/receivables/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::create
* @see app/Http/Controllers/ReceivableController.php:130
* @route '/receivables/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReceivableController::create
* @see app/Http/Controllers/ReceivableController.php:130
* @route '/receivables/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReceivableController::store
* @see app/Http/Controllers/ReceivableController.php:146
* @route '/receivables'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/receivables',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ReceivableController::store
* @see app/Http/Controllers/ReceivableController.php:146
* @route '/receivables'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::store
* @see app/Http/Controllers/ReceivableController.php:146
* @route '/receivables'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ReceivableController::show
* @see app/Http/Controllers/ReceivableController.php:196
* @route '/receivables/{receivable}'
*/
export const show = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/receivables/{receivable}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReceivableController::show
* @see app/Http/Controllers/ReceivableController.php:196
* @route '/receivables/{receivable}'
*/
show.url = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { receivable: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { receivable: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            receivable: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        receivable: typeof args.receivable === 'object'
        ? args.receivable.id
        : args.receivable,
    }

    return show.definition.url
            .replace('{receivable}', parsedArgs.receivable.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::show
* @see app/Http/Controllers/ReceivableController.php:196
* @route '/receivables/{receivable}'
*/
show.get = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReceivableController::show
* @see app/Http/Controllers/ReceivableController.php:196
* @route '/receivables/{receivable}'
*/
show.head = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReceivableController::edit
* @see app/Http/Controllers/ReceivableController.php:219
* @route '/receivables/{receivable}/edit'
*/
export const edit = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/receivables/{receivable}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReceivableController::edit
* @see app/Http/Controllers/ReceivableController.php:219
* @route '/receivables/{receivable}/edit'
*/
edit.url = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { receivable: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { receivable: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            receivable: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        receivable: typeof args.receivable === 'object'
        ? args.receivable.id
        : args.receivable,
    }

    return edit.definition.url
            .replace('{receivable}', parsedArgs.receivable.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::edit
* @see app/Http/Controllers/ReceivableController.php:219
* @route '/receivables/{receivable}/edit'
*/
edit.get = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReceivableController::edit
* @see app/Http/Controllers/ReceivableController.php:219
* @route '/receivables/{receivable}/edit'
*/
edit.head = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReceivableController::update
* @see app/Http/Controllers/ReceivableController.php:234
* @route '/receivables/{receivable}'
*/
export const update = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/receivables/{receivable}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ReceivableController::update
* @see app/Http/Controllers/ReceivableController.php:234
* @route '/receivables/{receivable}'
*/
update.url = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { receivable: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { receivable: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            receivable: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        receivable: typeof args.receivable === 'object'
        ? args.receivable.id
        : args.receivable,
    }

    return update.definition.url
            .replace('{receivable}', parsedArgs.receivable.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceivableController::update
* @see app/Http/Controllers/ReceivableController.php:234
* @route '/receivables/{receivable}'
*/
update.put = (args: { receivable: number | { id: number } } | [receivable: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

const receivables = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    payments: Object.assign(payments, payments),
}

export default receivables