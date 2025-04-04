import { queryParams, type QueryParams } from './../../../../wayfinder'

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::index
 * @see app/Http/Controllers/OnboardingCategoryController.php:19
 * @route /onboarding/categories
 */
export const index = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ['get','head'],
    url: '\/onboarding\/categories',
}

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::index
 * @see app/Http/Controllers/OnboardingCategoryController.php:19
 * @route /onboarding/categories
 */
index.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::index
 * @see app/Http/Controllers/OnboardingCategoryController.php:19
 * @route /onboarding/categories
 */
index.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: index.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::index
 * @see app/Http/Controllers/OnboardingCategoryController.php:19
 * @route /onboarding/categories
 */
index.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: index.url(options),
    method: 'head',
})

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::store
 * @see app/Http/Controllers/OnboardingCategoryController.php:31
 * @route /onboarding/categories
 */
export const store = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'post',
} => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ['post'],
    url: '\/onboarding\/categories',
}

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::store
 * @see app/Http/Controllers/OnboardingCategoryController.php:31
 * @route /onboarding/categories
 */
store.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return store.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::store
 * @see app/Http/Controllers/OnboardingCategoryController.php:31
 * @route /onboarding/categories
 */
store.post = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'post',
} => ({
    url: store.url(options),
    method: 'post',
})

const OnboardingCategoryController = { index, store }

export default OnboardingCategoryController