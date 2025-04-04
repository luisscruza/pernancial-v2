import { queryParams, type QueryParams } from './../../wayfinder'

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

const categories = { store }

export default categories