import { queryParams, type QueryParams } from './../../wayfinder'

/**
 * @see \App\Http\Controllers\Settings\ProfileController::destroy
 * @see app/Http/Controllers/Settings/ProfileController.php:47
 * @route /settings/profile
 */
export const destroy = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'delete',
} => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ['delete'],
    url: '\/settings\/profile',
}

/**
 * @see \App\Http\Controllers\Settings\ProfileController::destroy
 * @see app/Http/Controllers/Settings/ProfileController.php:47
 * @route /settings/profile
 */
destroy.url = (options?: { query?: QueryParams, mergeQuery?: QueryParams }) => {
    return destroy.definition.url + queryParams(options)
}

/**
 * @see \App\Http\Controllers\Settings\ProfileController::destroy
 * @see app/Http/Controllers/Settings/ProfileController.php:47
 * @route /settings/profile
 */
destroy.delete = (options?: { query?: QueryParams, mergeQuery?: QueryParams }): {
    url: string,
    method: 'delete',
} => ({
    url: destroy.url(options),
    method: 'delete',
})

export default destroy