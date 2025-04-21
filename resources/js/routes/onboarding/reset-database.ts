import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see routes/web.php:17
 * @route /reset-database
 */
export const resetDatabase = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: resetDatabase.url(options),
    method: 'get',
})

resetDatabase.definition = {
    methods: ['get','head'],
    url: '\/reset-database',
}

/**
 * @see routes/web.php:17
 * @route /reset-database
 */
resetDatabase.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return resetDatabase.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:17
 * @route /reset-database
 */
resetDatabase.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: resetDatabase.url(options),
    method: 'get',
})

/**
 * @see routes/web.php:17
 * @route /reset-database
 */
resetDatabase.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: resetDatabase.url(options),
    method: 'head',
})

export default resetDatabase