import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BudgetPeriodDuplicateController::__invoke
* @see app/Http/Controllers/BudgetPeriodDuplicateController.php:14
* @route '/budget-periods/{budgetPeriod}/duplicate'
*/
const BudgetPeriodDuplicateController = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: BudgetPeriodDuplicateController.url(args, options),
    method: 'get',
})

BudgetPeriodDuplicateController.definition = {
    methods: ["get","head"],
    url: '/budget-periods/{budgetPeriod}/duplicate',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BudgetPeriodDuplicateController::__invoke
* @see app/Http/Controllers/BudgetPeriodDuplicateController.php:14
* @route '/budget-periods/{budgetPeriod}/duplicate'
*/
BudgetPeriodDuplicateController.url = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { budgetPeriod: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { budgetPeriod: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            budgetPeriod: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        budgetPeriod: typeof args.budgetPeriod === 'object'
        ? args.budgetPeriod.id
        : args.budgetPeriod,
    }

    return BudgetPeriodDuplicateController.definition.url
            .replace('{budgetPeriod}', parsedArgs.budgetPeriod.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BudgetPeriodDuplicateController::__invoke
* @see app/Http/Controllers/BudgetPeriodDuplicateController.php:14
* @route '/budget-periods/{budgetPeriod}/duplicate'
*/
BudgetPeriodDuplicateController.get = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: BudgetPeriodDuplicateController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BudgetPeriodDuplicateController::__invoke
* @see app/Http/Controllers/BudgetPeriodDuplicateController.php:14
* @route '/budget-periods/{budgetPeriod}/duplicate'
*/
BudgetPeriodDuplicateController.head = (args: { budgetPeriod: number | { id: number } } | [budgetPeriod: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: BudgetPeriodDuplicateController.url(args, options),
    method: 'head',
})

export default BudgetPeriodDuplicateController