import type { Budget, BudgetSummary, Currency, SharedData, Transaction } from '@/types/index';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, Edit, Receipt, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Props {
    budget: Budget;
    budgetSummary: BudgetSummary;
    transactions: Transaction[];
}

const TransactionCard = ({ transaction, baseCurrency, categoryId }: { transaction: Transaction; baseCurrency: Currency; categoryId: string }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isIncome = transaction.type === 'income';

    // Color and icon based on transaction type
    const getTransactionStyle = () => {
        if (isIncome) {
            return {
                bgColor: 'bg-green-100',
                iconColor: 'text-green-600',
                textColor: 'text-green-600',
                icon: TrendingUp,
                sign: '+',
            };
        } else {
            return {
                bgColor: 'bg-red-100',
                iconColor: 'text-red-600',
                textColor: 'text-red-600',
                icon: Receipt,
                sign: '-',
            };
        }
    };

    const style = getTransactionStyle();
    const IconComponent = style.icon;

    const split = transaction.splits?.find((splitEntry) =>
        splitEntry.category?.id ? splitEntry.category.id === categoryId : splitEntry.category_id?.toString() === categoryId,
    );
    const displayAmount = split ? split.amount : transaction.amount;
    const displayConvertedAmount =
        split && transaction.converted_amount && transaction.amount
            ? (split.amount / transaction.amount) * transaction.converted_amount
            : transaction.converted_amount;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hover:bg-muted/30 flex items-center gap-4 rounded-lg border p-4 transition-colors"
        >
            <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-full ${style.bgColor} flex items-center justify-center`}>
                    <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
                </div>
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <p className="truncate font-medium text-gray-900">{transaction.description || 'Transacción sin descripción'}</p>
                    <div className="text-right">
                        <span className={`font-bold ${style.textColor}`}>
                            {style.sign}
                            {transaction.account?.currency
                                ? formatCurrency(Math.abs(displayAmount), transaction.account.currency)
                                : `€${Math.abs(displayAmount).toFixed(2)}`}
                        </span>
                        {/* Show converted amount if account currency is not base */}
                        {transaction.account?.currency && !transaction.account.currency.is_base && displayConvertedAmount && baseCurrency && (
                            <div className="text-xs text-gray-500">
                                ≈ {style.sign}
                                {formatCurrency(Math.abs(displayConvertedAmount), baseCurrency)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">{formatDate(transaction.transaction_date)}</span>
                    <span className="bg-muted rounded-full px-2 py-1 text-xs">{transaction.account.name}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default function BudgetShow({ budget, budgetSummary, transactions }: Props) {
    const { auth, base_currency } = usePage<
        SharedData & {
            base_currency: Currency;
        }
    >().props;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDateRange = () => {
        const startDate = formatDate(budget.budget_period?.start_date);
        const endDate = formatDate(budget.budget_period?.end_date);
        return `${startDate} - ${endDate}`;
    };

    const isIncome = budget.category.type === 'income';

    const getSplitForBudget = (transaction: Transaction) =>
        transaction.splits?.find((splitEntry) =>
            splitEntry.category?.id ? splitEntry.category.id === budget.category.id : splitEntry.category_id?.toString() === budget.category.id,
        );

    const getBaseAmount = (transaction: Transaction) => {
        const split = getSplitForBudget(transaction);

        if (!split) {
            return transaction.converted_amount ?? transaction.amount;
        }

        if (transaction.converted_amount && transaction.amount) {
            return (split.amount / transaction.amount) * transaction.converted_amount;
        }

        return split.amount;
    };

    const getStatusColor = () => {
        if (isIncome) {
            // For income, over budget is good!
            if (budgetSummary.is_over_budget) return 'default'; // Green/positive
            if (budgetSummary.percentage_used > 80) return 'default';
            return 'secondary';
        } else {
            // For expenses, over budget is bad
            if (budgetSummary.is_over_budget) return 'destructive';
            if (budgetSummary.percentage_used > 80) return 'secondary';
            return 'default';
        }
    };

    const getProgressColor = () => {
        if (isIncome) {
            // For income, over budget is good!
            if (budgetSummary.is_over_budget) return 'bg-green-500';
            if (budgetSummary.percentage_used > 80) return 'bg-green-400';
            return 'bg-blue-500';
        } else {
            // For expenses, over budget is bad
            if (budgetSummary.is_over_budget) return 'bg-destructive';
            if (budgetSummary.percentage_used > 80) return 'bg-yellow-500';
            return 'bg-primary';
        }
    };

    const getStatusText = () => {
        if (isIncome) {
            if (budgetSummary.is_over_budget) return '¡Ingreso extra!';
            return `${Math.round(budgetSummary.percentage_used)}% recibido`;
        } else {
            if (budgetSummary.is_over_budget) return 'Sobrepresupuesto';
            return `${Math.round(budgetSummary.percentage_used)}% usado`;
        }
    };

    // Group transactions by month
    const transactionsByMonth = transactions.reduce(
        (groups, transaction) => {
            const month = new Date(transaction.transaction_date).toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric',
            });
            if (!groups[month]) {
                groups[month] = [];
            }
            groups[month].push(transaction);
            return groups;
        },
        {} as Record<string, Transaction[]>,
    );

    return (
        <AppLayout title={budget.name}>
            <Head title={budget.name} />

            <div className="mx-auto w-full max-w-4xl p-4">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        {budget.budgetPeriod && (
                            <Link href={`/budget-periods/${budget.budgetPeriod.id}`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{budget.category.emoji}</span>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">{budget.name}</h1>
                                    <div className="text-muted-foreground mt-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDateRange()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor()} className="text-sm">
                                {getStatusText()}
                            </Badge>
                            <Link href={`/budgets/${budget.id}/edit`}>
                                <Button className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Editar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Budget Overview */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Presupuestado</CardTitle>
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(budget.amount, auth.user.currency)}</div>
                            <p className="text-muted-foreground text-xs">Límite establecido</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{isIncome ? 'Recibido' : 'Gastado'}</CardTitle>
                            {isIncome ? <TrendingUp className="h-4 w-4 text-green-600" /> : <ShoppingCart className="h-4 w-4 text-red-600" />}
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(budgetSummary.total_spent, auth.user.currency)}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {budgetSummary.transaction_count} transacción{budgetSummary.transaction_count !== 1 ? 'es' : ''}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {isIncome
                                    ? budgetSummary.is_over_budget
                                        ? 'Ingreso Extra'
                                        : 'Pendiente'
                                    : budgetSummary.is_over_budget
                                      ? 'Sobrepresupuesto'
                                      : 'Restante'}
                            </CardTitle>
                            {isIncome ? (
                                budgetSummary.is_over_budget ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-yellow-600" />
                                )
                            ) : budgetSummary.is_over_budget ? (
                                <TrendingUp className="text-destructive h-4 w-4" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-green-600" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    isIncome
                                        ? budgetSummary.is_over_budget
                                            ? 'text-green-600'
                                            : 'text-yellow-600'
                                        : budgetSummary.is_over_budget
                                          ? 'text-destructive'
                                          : 'text-green-600'
                                }`}
                            >
                                {formatCurrency(Math.abs(budgetSummary.remaining), auth.user.currency)}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {isIncome
                                    ? budgetSummary.is_over_budget
                                        ? '¡Por encima de lo esperado!'
                                        : 'Aún por recibir'
                                    : budgetSummary.is_over_budget
                                      ? 'Por encima del límite'
                                      : 'Disponible para gastar'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bar */}
                <Card>
                    <CardHeader>
                        <CardTitle>{isIncome ? 'Progreso de Ingresos' : 'Progreso del Presupuesto'}</CardTitle>
                        <CardDescription>
                            {Math.round(budgetSummary.percentage_used)}% del {isIncome ? 'ingreso esperado recibido' : 'presupuesto utilizado'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progreso</span>
                                <span className="font-medium">
                                    {formatCurrency(budgetSummary.total_spent, auth.user.currency)} /{' '}
                                    {formatCurrency(budget.amount, auth.user.currency)}
                                </span>
                            </div>
                            <div className="bg-muted h-3 w-full rounded-full">
                                <motion.div
                                    className={`h-3 rounded-full ${getProgressColor()}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(budgetSummary.percentage_used, 100)}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transacciones</CardTitle>
                        <CardDescription>Todas las transacciones relacionadas con este presupuesto</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.length > 0 ? (
                            <div className="space-y-6">
                                <AnimatePresence>
                                    {Object.entries(transactionsByMonth).map(([month, monthTransactions], monthIndex) => (
                                        <motion.div
                                            key={month}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: monthIndex * 0.1 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900 capitalize">{month}</h3>
                                                <span className="text-muted-foreground text-sm font-medium">
                                                    {monthTransactions.reduce((sum, t) => sum + Math.abs(getBaseAmount(t)), 0) > 0 &&
                                                        formatCurrency(
                                                            monthTransactions.reduce((sum, t) => sum + Math.abs(getBaseAmount(t)), 0),
                                                            base_currency || auth.user.currency,
                                                        )}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {monthTransactions.map((transaction) => (
                                                    <TransactionCard
                                                        key={transaction.id}
                                                        transaction={transaction}
                                                        baseCurrency={base_currency}
                                                        categoryId={budget.category.id}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                                <Receipt className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                                <h3 className="mb-2 text-lg font-semibold">No hay transacciones aún</h3>
                                <p className="text-muted-foreground mb-6">No se han registrado transacciones para esta categoría en este período.</p>
                                <Link href="/">
                                    <Button variant="outline">Ver cuentas</Button>
                                </Link>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
