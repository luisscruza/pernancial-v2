import { queryParams, type QueryParams } from './../../../../wayfinder'

/**
 * @see \App\Http\Controllers\OnboardingAccountController::index
 * @see app/Http/Controllers/OnboardingAccountController.php:20
 * @route /onboarding/accounts
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
    url: '\/onboarding\/accounts',
}

/**
 * @see \App\Http\Controllers\OnboardingAccountController::index
 * @see app/Http/Controllers/OnboardingAccountController.php:20
 * @route /onboarding/accounts
 */
index.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingAccountController::index
 * @see app/Http/Controllers/OnboardingAccountController.php:20
 * @route /onboarding/accounts
 */
index.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: index.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\OnboardingAccountController::index
 * @see app/Http/Controllers/OnboardingAccountController.php:20
 * @route /onboarding/accounts
 */
index.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: index.url(options),
    method: 'head',
})

/**
 * @see \App\Http\Controllers\OnboardingAccountController::store
 * @see app/Http/Controllers/OnboardingAccountController.php:40
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
 * @see app/Http/Controllers/OnboardingAccountController.php:40
 * @route /onboarding/accounts
 */
store.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return store.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingAccountController::store
 * @see app/Http/Controllers/OnboardingAccountController.php:40
 * @route /onboarding/accounts
 */
store.post = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'post',
} => ({
    url: store.url(options),
    method: 'post',
})

const OnboardingAccountController = { index, store }

export default OnboardingAccountController