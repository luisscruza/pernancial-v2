import type { BudgetPeriod, BudgetSummary, Category, Currency, SharedData } from '@/types/index';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Copy, DollarSign, Edit, Eye, Plus, TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Props {
    budgetPeriod: BudgetPeriod;
    budgetSummaries: BudgetSummary[];
    categories: Category[];
}

const BudgetRow = ({ summary, userCurrency }: { summary: BudgetSummary; userCurrency: Currency }) => {
    const { budget, total_spent: totalSpent, remaining, percentage_used: percentageUsed, is_over_budget: isOverBudget } = summary;
    const isIncome = budget.category.type === 'income';

    const getStatusColor = () => {
        if (isIncome) {
            // For income, over budget is good!
            if (isOverBudget) return 'default'; // Green/positive
            if (percentageUsed > 80) return 'default';
            return 'secondary';
        } else {
            // For expenses, over budget is bad
            if (isOverBudget) return 'destructive';
            if (percentageUsed > 80) return 'secondary';
            return 'default';
        }
    };

    const getProgressColor = () => {
        if (isIncome) {
            // For income, over budget is good!
            if (isOverBudget) return 'bg-green-500';
            if (percentageUsed > 80) return 'bg-green-400';
            return 'bg-blue-500';
        } else {
            // For expenses, over budget is bad
            if (isOverBudget) return 'bg-destructive';
            if (percentageUsed > 80) return 'bg-yellow-500';
            return 'bg-primary';
        }
    };

    const getStatusText = () => {
        if (isIncome) {
            if (isOverBudget) return '¡Extra!';
            return `${Math.round(percentageUsed)}%`;
        } else {
            if (isOverBudget) return 'Sobregirado';
            return `${Math.round(percentageUsed)}%`;
        }
    };

    return (
        <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hover:bg-muted/30 border-b transition-colors">
            {/* Category */}
            <td className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{budget.category.emoji}</span>
                    <div>
                        <div className="font-medium">{budget.category.name}</div>
                        <div className="text-muted-foreground text-sm">
                            {summary.transaction_count} transacción{summary.transaction_count !== 1 ? 'es' : ''}
                        </div>
                    </div>
                </div>
            </td>

            {/* Presupuestado */}
            <td className="px-4 py-4 text-right">
                <div className="font-medium">{formatCurrency(budget.amount, userCurrency)}</div>
            </td>

            {/* Gastado/Ingresado */}
            <td className="px-4 py-4 text-right">
                <div className="font-medium">{formatCurrency(totalSpent, userCurrency)}</div>
            </td>

            {/* Restante/Sobregirado */}
            <td className="px-4 py-4 text-right">
                <div
                    className={`flex items-center justify-end gap-1 font-medium ${
                        isIncome ? (isOverBudget ? 'text-green-600' : 'text-yellow-600') : isOverBudget ? 'text-destructive' : 'text-green-600'
                    }`}
                >
                    {(isOverBudget && !isIncome) || (!isOverBudget && isIncome) ? (
                        <TrendingUp className="h-4 w-4" />
                    ) : (
                        <TrendingDown className="h-4 w-4" />
                    )}
                    {formatCurrency(Math.abs(remaining), userCurrency)}
                </div>
            </td>

            {/* Progreso */}
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <div className="bg-muted h-2 w-full rounded-full">
                            <motion.div
                                className={`h-2 rounded-full ${getProgressColor()}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                    <Badge variant={getStatusColor()} className="text-xs">
                        {getStatusText()}
                    </Badge>
                </div>
            </td>

            {/* Acciones */}
            <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                    <Link href={route('budgets.show', budget.id)}>
                        <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={route('budgets.edit', budget.id)}>
                        <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </td>
        </motion.tr>
    );
};

export default function BudgetPeriodShow({ budgetPeriod, budgetSummaries }: Props) {
    const { auth } = usePage<SharedData>().props;
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDateRange = () => {
        const startDate = formatDate(budgetPeriod.start_date);
        const endDate = formatDate(budgetPeriod.end_date);
        return `${startDate} - ${endDate}`;
    };

    // Group budget summaries by category type
    const expenseBudgets = budgetSummaries.filter((summary) => summary.budget.category.type === 'expense');
    const incomeBudgets = budgetSummaries.filter((summary) => summary.budget.category.type === 'income');

    // Calculate expense totals
    const totalExpenseBudgeted = expenseBudgets.reduce((sum, summary) => {
        const amount = Number(summary.budget?.amount || 0);
        return sum + amount;
    }, 0);

    const totalExpenseSpent = expenseBudgets.reduce((sum, summary) => {
        const spent = Number(summary.total_spent || 0);
        return sum + spent;
    }, 0);

    // Calculate income totals
    const totalIncomeBudgeted = incomeBudgets.reduce((sum, summary) => {
        const amount = Number(summary.budget?.amount || 0);
        return sum + amount;
    }, 0);

    const totalIncomeReceived = incomeBudgets.reduce((sum, summary) => {
        const received = Number(summary.total_spent || 0);
        return sum + received;
    }, 0);

    // Calculate progress and status
    const expenseProgress = totalExpenseBudgeted > 0 ? (totalExpenseSpent / totalExpenseBudgeted) * 100 : 0;
    const incomeProgress = totalIncomeBudgeted > 0 ? (totalIncomeReceived / totalIncomeBudgeted) * 100 : 0;
    const isExpenseOverBudget = totalExpenseSpent > totalExpenseBudgeted;
    const isIncomeOverBudget = totalIncomeReceived > totalIncomeBudgeted; // This is actually good for income!

    // Check period status
    const today = new Date();
    const startDate = new Date(budgetPeriod.start_date);
    const endDate = new Date(budgetPeriod.end_date);

    let periodStatus: 'current' | 'upcoming' | 'past' = 'past';
    if (today < startDate) {
        periodStatus = 'upcoming';
    } else if (today <= endDate) {
        periodStatus = 'current';
    }

    return (
        <AppLayout title={budgetPeriod.name}>
            <Head title={budgetPeriod.name} />

            <div className="mx-auto w-full max-w-4xl p-4">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Link href="/budgets">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                    </div>

                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">{budgetPeriod.name}</h1>
                                <Badge variant={periodStatus === 'current' ? 'default' : periodStatus === 'upcoming' ? 'secondary' : 'destructive'}>
                                    {periodStatus === 'current' ? 'actual' : periodStatus === 'upcoming' ? 'próximo' : 'pasado'}
                                </Badge>
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDateRange()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={route('budget-periods.duplicate', budgetPeriod.id)}>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Copy className="h-4 w-4" />
                                    Duplicar
                                </Button>
                            </Link>
                            <Link href={route('budget-periods.edit', budgetPeriod.id)}>
                                <Button className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    Editar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Period Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen</CardTitle>
                        <CardDescription>Resumen total del presupuesto y gastos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Expense Summary */}
                            {expenseBudgets.length > 0 && (
                                <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-red-700">📉 Resumen de Gastos</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-muted-foreground text-xs">Presupuesto</div>
                                            <div className="text-lg font-bold">{formatCurrency(totalExpenseBudgeted, auth.user.currency)}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-muted-foreground text-xs">Gastado</div>
                                            <div className="text-lg font-bold text-red-600">
                                                {formatCurrency(totalExpenseSpent, auth.user.currency)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-muted-foreground text-xs">{isExpenseOverBudget ? 'Sobregirado' : 'Disponible'}</div>
                                        <div className={`text-lg font-bold ${isExpenseOverBudget ? 'text-destructive' : 'text-green-600'}`}>
                                            {formatCurrency(Math.abs(totalExpenseBudgeted - totalExpenseSpent), auth.user.currency)}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Progreso</span>
                                            <span className="font-medium">{Math.round(expenseProgress)}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-white">
                                            <motion.div
                                                className={`h-2 rounded-full ${
                                                    isExpenseOverBudget ? 'bg-destructive' : expenseProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(expenseProgress, 100)}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Income Summary */}
                            {incomeBudgets.length > 0 && (
                                <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-green-700">📈 Resumen de Ingresos</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-muted-foreground text-xs">Esperado</div>
                                            <div className="text-lg font-bold">{formatCurrency(totalIncomeBudgeted, auth.user.currency)}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-muted-foreground text-xs">Recibido</div>
                                            <div className="text-lg font-bold text-green-600">
                                                {formatCurrency(totalIncomeReceived, auth.user.currency)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-muted-foreground text-xs">{isIncomeOverBudget ? 'Ingreso extra 🎉' : 'Pendiente'}</div>
                                        <div className={`text-lg font-bold ${isIncomeOverBudget ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {formatCurrency(Math.abs(totalIncomeReceived - totalIncomeBudgeted), auth.user.currency)}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Progreso</span>
                                            <span className="font-medium">{Math.round(incomeProgress)}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-white">
                                            <motion.div
                                                className={`h-2 rounded-full ${
                                                    isIncomeOverBudget ? 'bg-green-500' : incomeProgress > 80 ? 'bg-green-400' : 'bg-blue-500'
                                                }`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(incomeProgress, 100)}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Budget List */}
                <div className="mt-4 space-y-6">
                    <h2 className="text-xl font-semibold">Presupuestos por Categoría</h2>

                    {budgetSummaries.length > 0 ? (
                        <div className="space-y-8">
                            {/* Expense Budgets */}
                            {expenseBudgets.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                    <h3 className="mb-4 text-lg font-medium text-gray-900">Gastos</h3>
                                    <div className="ring-opacity-5 overflow-x-auto rounded-lg bg-white shadow ring-1 ring-gray-200">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Categoría
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Presupuestado
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Gastado
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Restante
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Progreso
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {expenseBudgets.map((summary) => (
                                                    <BudgetRow key={summary.budget.id} summary={summary} userCurrency={auth.user.currency} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {/* Income Budgets */}
                            {incomeBudgets.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                                    <h3 className="mb-4 text-lg font-medium text-gray-900">Ingresos</h3>
                                    <div className="ring-opacity-5 overflow-x-auto rounded-lg bg-white shadow ring-1 ring-gray-200">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Categoría
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Presupuestado
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Recibido
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Diferencia
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Progreso
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wide text-gray-500 uppercase">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {incomeBudgets.map((summary) => (
                                                    <BudgetRow key={summary.budget.id} summary={summary} userCurrency={auth.user.currency} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                            <DollarSign className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                            <h3 className="mb-2 text-lg font-semibold">No hay presupuestos aún</h3>
                            <p className="text-muted-foreground mb-6">
                                Agrega tu primer presupuesto para comenzar a rastrear gastos en este período.
                            </p>
                            <Link href={`/budget-periods/${budgetPeriod.id}/add-budget`}>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Agregar Tu Primer Presupuesto
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
