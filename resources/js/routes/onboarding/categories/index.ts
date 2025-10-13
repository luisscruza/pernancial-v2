import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\OnboardingCategoryController::store
* @see app/Http/Controllers/OnboardingCategoryController.php:33
* @route '/onboarding/categories'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/onboarding/categories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OnboardingCategoryController::store
* @see app/Http/Controllers/OnboardingCategoryController.php:33
* @route '/onboarding/categories'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingCategoryController::store
* @see app/Http/Controllers/OnboardingCategoryController.php:33
* @route '/onboarding/categories'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const categories = {
    store: Object.assign(store, store),
}

export default categories