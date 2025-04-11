import { queryParams, type QueryParams } from './../wayfinder'

/**
 * @see routes/auth.php:16
 * @route /auth
 */
export const auth = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: auth.url(options),
    method: 'get',
})

auth.definition = {
    methods: ['get','head'],
    url: '\/auth',
}

/**
 * @see routes/auth.php:16
 * @route /auth
 */
auth.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return auth.definition.url + queryParams(options)
}

/**
 * @see routes/auth.php:16
 * @route /auth
 */
auth.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: auth.url(options),
    method: 'get',
})

/**
 * @see routes/auth.php:16
 * @route /auth
 */
auth.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: auth.url(options),
    method: 'head',
})

export default auth