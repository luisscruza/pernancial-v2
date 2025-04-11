import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see \App\Http\Controllers\Settings\ProfileController::update
 * @see app/Http/Controllers/Settings/ProfileController.php:31
 * @route /settings/profile
 */
export const update = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'patch',
} => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ['patch'],
    url: '\/settings\/profile',
}

/**
 * @see \App\Http\Controllers\Settings\ProfileController::update
 * @see app/Http/Controllers/Settings/ProfileController.php:31
 * @route /settings/profile
 */
update.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return update.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\Settings\ProfileController::update
 * @see app/Http/Controllers/Settings/ProfileController.php:31
 * @route /settings/profile
 */
update.patch = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'patch',
} => ({
    url: update.url(options),
    method: 'patch',
})

export default update