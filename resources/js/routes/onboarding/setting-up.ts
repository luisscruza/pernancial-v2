import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see routes/web.php:26
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
 * @see routes/web.php:26
 * @route /onboarding/setting-up
 */
settingUp.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return settingUp.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:26
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
 * @see routes/web.php:26
 * @route /onboarding/setting-up
 */
settingUp.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: settingUp.url(options),
    method: 'head',
})

export default settingUp