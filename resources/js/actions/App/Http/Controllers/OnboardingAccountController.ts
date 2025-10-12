import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OnboardingAccountController::index
* @see app/Http/Controllers/OnboardingAccountController.php:21
* @route '/onboarding/accounts'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/onboarding/accounts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OnboardingAccountController::index
* @see app/Http/Controllers/OnboardingAccountController.php:21
* @route '/onboarding/accounts'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingAccountController::index
* @see app/Http/Controllers/OnboardingAccountController.php:21
* @route '/onboarding/accounts'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OnboardingAccountController::index
* @see app/Http/Controllers/OnboardingAccountController.php:21
* @route '/onboarding/accounts'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OnboardingAccountController::store
* @see app/Http/Controllers/OnboardingAccountController.php:38
* @route '/onboarding/accounts'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/onboarding/accounts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OnboardingAccountController::store
* @see app/Http/Controllers/OnboardingAccountController.php:38
* @route '/onboarding/accounts'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingAccountController::store
* @see app/Http/Controllers/OnboardingAccountController.php:38
* @route '/onboarding/accounts'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const OnboardingAccountController = { index, store }

export default OnboardingAccountController