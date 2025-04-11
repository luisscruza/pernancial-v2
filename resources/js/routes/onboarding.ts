import { queryParams, type QueryParams } from './../wayfinder'

/**
 * @see \App\Http\Controllers\OnboardingController::onboarding
 * @see app/Http/Controllers/OnboardingController.php:13
 * @route /onboarding
 */
export const onboarding = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: onboarding.url(options),
    method: 'get',
})

onboarding.definition = {
    methods: ['get','head'],
    url: '\/onboarding',
}

/**
 * @see \App\Http\Controllers\OnboardingController::onboarding
 * @see app/Http/Controllers/OnboardingController.php:13
 * @route /onboarding
 */
onboarding.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return onboarding.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingController::onboarding
 * @see app/Http/Controllers/OnboardingController.php:13
 * @route /onboarding
 */
onboarding.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: onboarding.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\OnboardingController::onboarding
 * @see app/Http/Controllers/OnboardingController.php:13
 * @route /onboarding
 */
onboarding.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: onboarding.url(options),
    method: 'head',
})

export default onboarding