import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\OnboardingAccountController::store
* @see app/Http/Controllers/OnboardingAccountController.php:41
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
* @see app/Http/Controllers/OnboardingAccountController.php:41
* @route '/onboarding/accounts'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingAccountController::store
* @see app/Http/Controllers/OnboardingAccountController.php:41
* @route '/onboarding/accounts'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const accounts = {
    store: Object.assign(store, store),
}

export default accounts