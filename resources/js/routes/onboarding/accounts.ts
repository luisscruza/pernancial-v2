import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see \App\Http\Controllers\OnboardingAccountController::accounts
 * @see app/Http/Controllers/OnboardingAccountController.php:21
 * @route /onboarding/accounts
 */
export const accounts = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: accounts.url(options),
    method: 'get',
})

accounts.definition = {
    methods: ['get','head'],
    url: '\/onboarding\/accounts',
}

/**
 * @see \App\Http\Controllers\OnboardingAccountController::accounts
 * @see app/Http/Controllers/OnboardingAccountController.php:21
 * @route /onboarding/accounts
 */
accounts.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return accounts.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingAccountController::accounts
 * @see app/Http/Controllers/OnboardingAccountController.php:21
 * @route /onboarding/accounts
 */
accounts.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: accounts.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\OnboardingAccountController::accounts
 * @see app/Http/Controllers/OnboardingAccountController.php:21
 * @route /onboarding/accounts
 */
accounts.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: accounts.url(options),
    method: 'head',
})

export default accounts