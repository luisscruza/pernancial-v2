import { Head, Link, usePage } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Edit, TrendingUp, TrendingDown, DollarSign, Receipt, ShoppingCart } from 'lucide-react'
import type { Budget, Transaction, BudgetSummary, SharedData, Currency } from '@/types/index'
import { formatCurrency } from '@/utils/currency'

import AppLayout from '@/layouts/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  budget: Budget
  budgetSummary: BudgetSummary
  transactions: Transaction[]
}

const TransactionCard = ({ transaction, baseCurrency }: { 
  transaction: Transaction, 
  baseCurrency: Currency 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isIncome = transaction.type === 'income'
  
  // Color and icon based on transaction type
  const getTransactionStyle = () => {
    if (isIncome) {
      return {
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        textColor: 'text-green-600',
        icon: TrendingUp,
        sign: '+'
      }
    } else {
      return {
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        textColor: 'text-red-600',
        icon: Receipt,
        sign: '-'
      }
    }
  }

  const style = getTransactionStyle()
  const IconComponent = style.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
    >
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-full ${style.bgColor} flex items-center justify-center`}>
          <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 truncate">
            {transaction.description || 'Transacción sin descripción'}
          </p>
          <div className="text-right">
            <span className={`font-bold ${style.textColor}`}>
              {style.sign}{transaction.account?.currency ? formatCurrency(Math.abs(transaction.amount), transaction.account.currency) : `€${Math.abs(transaction.amount).toFixed(2)}`}
            </span>
            {/* Show converted amount if account currency is not base */}
            {transaction.account?.currency && !transaction.account.currency.is_base && transaction.converted_amount && baseCurrency && (
              <div className="text-xs text-gray-500">
                ≈ {style.sign}{formatCurrency(Math.abs(transaction.converted_amount), baseCurrency)}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">
            {formatDate(transaction.transaction_date)}
          </span>
          <span className="text-xs px-2 py-1 bg-muted rounded-full">
            {transaction.account.name}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function BudgetShow({ budget, budgetSummary, transactions }: Props) {
  const { auth, base_currency } = usePage<SharedData & {
    base_currency: Currency
  }>().props

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateRange = () => {
    const startDate = formatDate(budget.budget_period?.start_date)
    const endDate = formatDate(budget.budget_period?.end_date)
    return `${startDate} - ${endDate}`
  }

  const isIncome = budget.category.type === 'income'

  const getStatusColor = () => {
    if (isIncome) {
      // For income, over budget is good!
      if (budgetSummary.is_over_budget) return 'default' // Green/positive
      if (budgetSummary.percentage_used > 80) return 'default'
      return 'secondary'
    } else {
      // For expenses, over budget is bad
      if (budgetSummary.is_over_budget) return 'destructive'
      if (budgetSummary.percentage_used > 80) return 'secondary'
      return 'default'
    }
  }

  const getProgressColor = () => {
    if (isIncome) {
      // For income, over budget is good!
      if (budgetSummary.is_over_budget) return 'bg-green-500'
      if (budgetSummary.percentage_used > 80) return 'bg-green-400'
      return 'bg-blue-500'
    } else {
      // For expenses, over budget is bad
      if (budgetSummary.is_over_budget) return 'bg-destructive'
      if (budgetSummary.percentage_used > 80) return 'bg-yellow-500'
      return 'bg-primary'
    }
  }

  const getStatusText = () => {
    if (isIncome) {
      if (budgetSummary.is_over_budget) return '¡Ingreso extra!'
      return `${Math.round(budgetSummary.percentage_used)}% recibido`
    } else {
      if (budgetSummary.is_over_budget) return 'Sobrepresupuesto'
      return `${Math.round(budgetSummary.percentage_used)}% usado`
    }
  }

  // Group transactions by month
  const transactionsByMonth = transactions.reduce((groups, transaction) => {
    const month = new Date(transaction.transaction_date).toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    })
    if (!groups[month]) {
      groups[month] = []
    }
    groups[month].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

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
                  <ArrowLeft className="w-4 h-4 mr-2" />
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
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4" />
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
                  <Edit className="w-4 h-4" />
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
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(budget.amount, auth.user.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                Límite establecido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isIncome ? 'Recibido' : 'Gastado'}
              </CardTitle>
              {isIncome ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <ShoppingCart className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(budgetSummary.total_spent, auth.user.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {budgetSummary.transaction_count} transacción{budgetSummary.transaction_count !== 1 ? 'es' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isIncome 
                  ? (budgetSummary.is_over_budget ? 'Ingreso Extra' : 'Pendiente')
                  : (budgetSummary.is_over_budget ? 'Sobrepresupuesto' : 'Restante')
                }
              </CardTitle>
              {isIncome ? (
                budgetSummary.is_over_budget ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-yellow-600" />
                )
              ) : (
                budgetSummary.is_over_budget ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                )
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                isIncome 
                  ? (budgetSummary.is_over_budget ? 'text-green-600' : 'text-yellow-600')
                  : (budgetSummary.is_over_budget ? 'text-destructive' : 'text-green-600')
              }`}>
                {formatCurrency(Math.abs(budgetSummary.remaining), auth.user.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {isIncome 
                  ? (budgetSummary.is_over_budget ? '¡Por encima de lo esperado!' : 'Aún por recibir')
                  : (budgetSummary.is_over_budget ? 'Por encima del límite' : 'Disponible para gastar')
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isIncome ? 'Progreso de Ingresos' : 'Progreso del Presupuesto'}
            </CardTitle>
            <CardDescription>
              {Math.round(budgetSummary.percentage_used)}% del {isIncome ? 'ingreso esperado recibido' : 'presupuesto utilizado'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">
                  {formatCurrency(budgetSummary.total_spent, auth.user.currency)} / {formatCurrency(budget.amount, auth.user.currency)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
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
            <CardDescription>
              Todas las transacciones relacionadas con este presupuesto
            </CardDescription>
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
                        <span className="text-sm font-medium text-muted-foreground">
                          {monthTransactions.reduce((sum, t) => sum + Math.abs(t.converted_amount || t.amount), 0) > 0 && 
                            formatCurrency(
                              monthTransactions.reduce((sum, t) => sum + Math.abs(t.converted_amount || t.amount), 0), 
                              base_currency || auth.user.currency
                            )
                          }
                        </span>
                      </div>
                      <div className="space-y-2">
                        {monthTransactions.map((transaction) => (
                          <TransactionCard 
                            key={transaction.id} 
                            transaction={transaction} 
                            baseCurrency={base_currency}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay transacciones aún</h3>
                <p className="text-muted-foreground mb-6">
                  No se han registrado transacciones para esta categoría en este período.
                </p>
                <Link href="/">
                  <Button variant="outline">
                    Ver cuentas
                  </Button>
                </Link>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}