import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OnboardingController::__invoke
* @see app/Http/Controllers/OnboardingController.php:13
* @route '/onboarding'
*/
const OnboardingController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: OnboardingController.url(options),
    method: 'get',
})

OnboardingController.definition = {
    methods: ["get","head"],
    url: '/onboarding',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OnboardingController::__invoke
* @see app/Http/Controllers/OnboardingController.php:13
* @route '/onboarding'
*/
OnboardingController.url = (options?: RouteQueryOptions) => {
    return OnboardingController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingController::__invoke
* @see app/Http/Controllers/OnboardingController.php:13
* @route '/onboarding'
*/
OnboardingController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: OnboardingController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OnboardingController::__invoke
* @see app/Http/Controllers/OnboardingController.php:13
* @route '/onboarding'
*/
OnboardingController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: OnboardingController.url(options),
    method: 'head',
})

export default OnboardingController