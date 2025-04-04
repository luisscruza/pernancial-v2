import { queryParams, type QueryParams } from './../../../../wayfinder'

/**
 * @see \App\Http\Controllers\OnboardingController::OnboardingController
 * @see app/Http/Controllers/OnboardingController.php:12
 * @route /onboarding
 */
const OnboardingController = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: OnboardingController.url(options),
    method: 'get',
})

OnboardingController.definition = {
    methods: ['get','head'],
    url: '\/onboarding',
}

/**
 * @see \App\Http\Controllers\OnboardingController::OnboardingController
 * @see app/Http/Controllers/OnboardingController.php:12
 * @route /onboarding
 */
OnboardingController.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return OnboardingController.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingController::OnboardingController
 * @see app/Http/Controllers/OnboardingController.php:12
 * @route /onboarding
 */
OnboardingController.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: OnboardingController.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\OnboardingController::OnboardingController
 * @see app/Http/Controllers/OnboardingController.php:12
 * @route /onboarding
 */
OnboardingController.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: OnboardingController.url(options),
    method: 'head',
})

export default OnboardingController