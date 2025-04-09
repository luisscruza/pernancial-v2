import { queryParams, type QueryParams } from './../wayfinder'

/**
 * @see \App\Http\Controllers\OnboardingController::onboarding
 * @see app/Http/Controllers/OnboardingController.php:12
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
 * @see app/Http/Controllers/OnboardingController.php:12
 * @route /onboarding
 */
onboarding.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return onboarding.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingController::onboarding
 * @see app/Http/Controllers/OnboardingController.php:12
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
 * @see app/Http/Controllers/OnboardingController.php:12
 * @route /onboarding
 */
onboarding.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: onboarding.url(options),
    method: 'head',
})

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::categories
 * @see app/Http/Controllers/OnboardingCategoryController.php:19
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
 * @see app/Http/Controllers/OnboardingCategoryController.php:19
 * @route /onboarding/categories
 */
categories.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return categories.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingCategoryController::categories
 * @see app/Http/Controllers/OnboardingCategoryController.php:19
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
 * @see app/Http/Controllers/OnboardingCategoryController.php:19
 * @route /onboarding/categories
 */
categories.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: categories.url(options),
    method: 'head',
})

/**
 * @see \App\Http\Controllers\OnboardingAccountController::accounts
 * @see app/Http/Controllers/OnboardingAccountController.php:20
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
 * @see app/Http/Controllers/OnboardingAccountController.php:20
 * @route /onboarding/accounts
 */
accounts.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return accounts.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\OnboardingAccountController::accounts
 * @see app/Http/Controllers/OnboardingAccountController.php:20
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
 * @see app/Http/Controllers/OnboardingAccountController.php:20
 * @route /onboarding/accounts
 */
accounts.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: accounts.url(options),
    method: 'head',
})

/**
 * @see routes/web.php:25
 * @route /onboarding/setting-up
 */
export const settingUp = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: settingUp.url(options),
    method: 'get',
})

settingUp.definition = {
    methods: ['get','head'],
    url: '\/onboarding\/setting-up',
}

/**
 * @see routes/web.php:25
 * @route /onboarding/setting-up
 */
settingUp.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return settingUp.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:25
 * @route /onboarding/setting-up
 */
settingUp.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: settingUp.url(options),
    method: 'get',
})

/**
 * @see routes/web.php:25
 * @route /onboarding/setting-up
 */
settingUp.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: settingUp.url(options),
    method: 'head',
})

const onboarding = { onboarding, categories, accounts, settingUp }

export default onboarding