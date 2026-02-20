import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import categories08bc8d from './categories'
import accountsDb024e from './accounts'
/**
* @see \App\Http\Controllers\OnboardingCategoryController::categories
* @see app/Http/Controllers/OnboardingCategoryController.php:21
* @route '/onboarding/categories'
*/
export const categories = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})

categories.definition = {
    methods: ["get","head"],
    url: '/onboarding/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OnboardingCategoryController::categories
* @see app/Http/Controllers/OnboardingCategoryController.php:21
* @route '/onboarding/categories'
*/
categories.url = (options?: RouteQueryOptions) => {
    return categories.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingCategoryController::categories
* @see app/Http/Controllers/OnboardingCategoryController.php:21
* @route '/onboarding/categories'
*/
categories.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OnboardingCategoryController::categories
* @see app/Http/Controllers/OnboardingCategoryController.php:21
* @route '/onboarding/categories'
*/
categories.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: categories.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OnboardingAccountController::accounts
* @see app/Http/Controllers/OnboardingAccountController.php:21
* @route '/onboarding/accounts'
*/
export const accounts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: accounts.url(options),
    method: 'get',
})

accounts.definition = {
    methods: ["get","head"],
    url: '/onboarding/accounts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OnboardingAccountController::accounts
* @see app/Http/Controllers/OnboardingAccountController.php:21
* @route '/onboarding/accounts'
*/
accounts.url = (options?: RouteQueryOptions) => {
    return accounts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingAccountController::accounts
* @see app/Http/Controllers/OnboardingAccountController.php:21
* @route '/onboarding/accounts'
*/
accounts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: accounts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OnboardingAccountController::accounts
* @see app/Http/Controllers/OnboardingAccountController.php:21
* @route '/onboarding/accounts'
*/
accounts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: accounts.url(options),
    method: 'head',
})

/**
* @see routes/web.php:115
* @route '/onboarding/setting-up'
*/
export const settingUp = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settingUp.url(options),
    method: 'get',
})

settingUp.definition = {
    methods: ["get","head"],
    url: '/onboarding/setting-up',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:115
* @route '/onboarding/setting-up'
*/
settingUp.url = (options?: RouteQueryOptions) => {
    return settingUp.definition.url + queryParams(options)
}

/**
* @see routes/web.php:115
* @route '/onboarding/setting-up'
*/
settingUp.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settingUp.url(options),
    method: 'get',
})

/**
* @see routes/web.php:115
* @route '/onboarding/setting-up'
*/
settingUp.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settingUp.url(options),
    method: 'head',
})

const onboarding = {
    categories: Object.assign(categories, categories08bc8d),
    accounts: Object.assign(accounts, accountsDb024e),
    settingUp: Object.assign(settingUp, settingUp),
}

export default onboarding