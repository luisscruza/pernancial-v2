import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see \App\Http\Controllers\Settings\ProfileController::edit
 * @see app/Http/Controllers/Settings/ProfileController.php:20
 * @route /settings/profile
 */
export const edit = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ['get','head'],
    url: '\/settings\/profile',
}

/**
 * @see \App\Http\Controllers\Settings\ProfileController::edit
 * @see app/Http/Controllers/Settings/ProfileController.php:20
 * @route /settings/profile
 */
edit.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return edit.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\Settings\ProfileController::edit
 * @see app/Http/Controllers/Settings/ProfileController.php:20
 * @route /settings/profile
 */
edit.get = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'get',
} => ({
    url: edit.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\Settings\ProfileController::edit
 * @see app/Http/Controllers/Settings/ProfileController.php:20
 * @route /settings/profile
 */
edit.head = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'head',
} => ({
    url: edit.url(options),
    method: 'head',
})

export default edit