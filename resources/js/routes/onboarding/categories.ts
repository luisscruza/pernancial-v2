import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::categories
 * @see app/Http/Controllers/OnboardingCategoryController.php:20
 * @route /onboarding/categories
 */
export const categories = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: categories.url(options),
    method: 'get',
})

categories.definition = {
    methods: ['get','head'],
    url: '\/onboarding\/categories',
}

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::categories
 * @see app/Http/Controllers/OnboardingCategoryController.php:20
 * @route /onboarding/categories
 */
categories.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return categories.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::categories
 * @see app/Http/Controllers/OnboardingCategoryController.php:20
 * @route /onboarding/categories
 */
categories.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: categories.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::categories
 * @see app/Http/Controllers/OnboardingCategoryController.php:20
 * @route /onboarding/categories
 */
categories.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: categories.url(options),
    method: 'head',
})

export default categories