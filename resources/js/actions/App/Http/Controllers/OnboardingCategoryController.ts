import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OnboardingCategoryController::index
* @see app/Http/Controllers/OnboardingCategoryController.php:20
* @route '/onboarding/categories'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/onboarding/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OnboardingCategoryController::index
* @see app/Http/Controllers/OnboardingCategoryController.php:20
* @route '/onboarding/categories'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingCategoryController::index
* @see app/Http/Controllers/OnboardingCategoryController.php:20
* @route '/onboarding/categories'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OnboardingCategoryController::index
* @see app/Http/Controllers/OnboardingCategoryController.php:20
* @route '/onboarding/categories'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OnboardingCategoryController::store
* @see app/Http/Controllers/OnboardingCategoryController.php:32
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
* @see app/Http/Controllers/OnboardingCategoryController.php:32
* @route '/onboarding/categories'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingCategoryController::store
* @see app/Http/Controllers/OnboardingCategoryController.php:32
* @route '/onboarding/categories'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const OnboardingCategoryController = { index, store }

export default OnboardingCategoryController