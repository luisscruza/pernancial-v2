import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see \App\Http\Controllers\OnboardingAccountController::store
 * @see app/Http/Controllers/OnboardingAccountController.php:41
 * @route /onboarding/accounts
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
    url: '\/onboarding\/accounts',
}

/**
 * @see \App\Http\Controllers\OnboardingAccountController::store
 * @see app/Http/Controllers/OnboardingAccountController.php:41
 * @route /onboarding/accounts
 */
store.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return store.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingAccountController::store
 * @see app/Http/Controllers/OnboardingAccountController.php:41
 * @route /onboarding/accounts
 */
store.post = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'post',
} => ({
    url: store.url(options),
    method: 'post',
})

const accounts = { store }

export default accounts