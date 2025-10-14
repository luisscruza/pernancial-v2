import { Head, Link, usePage } from '@inertiajs/react'
import { motion } from 'framer-motion'
import { Calendar, Plus, PlusIcon } from 'lucide-react'
import type { BudgetPeriod, SharedData, Currency } from '@/types/index'
import { formatCurrency } from '@/utils/currency'

import AppLayout from '@/layouts/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  budgetPeriods: BudgetPeriod[]
}

const BudgetPeriodCard = ({ period, userCurrency }: { period: BudgetPeriod, userCurrency: Currency }) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to start of day
  const startDate = new Date(period.start_date)
  const endDate = new Date(period.end_date)

  let status: 'actual' | 'futuro' | 'pasado' = 'pasado'
  let statusColor: 'default' | 'secondary' | 'destructive' = 'destructive'

  if (today < startDate) {
    status = 'futuro'
    statusColor = 'secondary'
  } else if (today > endDate) {
    status = 'pasado'
    statusColor = 'destructive'
  } else {
    status = 'actual'
    statusColor = 'default'
  }

  // Separate expense and income budgets
  const expenseBudgets = period.budgets?.filter(budget => budget.category?.type === 'expense') || []
  const incomeBudgets = period.budgets?.filter(budget => budget.category?.type === 'income') || []

  const totalExpenseBudget = expenseBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0)
  const totalIncomeBudget = incomeBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0)
  
  // Use the separated totals from backend
  const totalExpenseSpent = period.total_expense_spent || 0
  const totalIncomeReceived = period.total_income_received || 0
  const expenseProgress = totalExpenseBudget > 0 ? (totalExpenseSpent / totalExpenseBudget) * 100 : 0

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Link href={`/budget-periods/${period.id}`}>
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{period.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(startDate)} - {formatDate(endDate)}
            </CardDescription>
          </div>
          <Badge variant={statusColor} className="capitalize">
            {status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Expense Progress */}
          {expenseBudgets.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-600">💸 Gastos</span>
                <span className="font-medium">
                  {formatCurrency(totalExpenseSpent, userCurrency)} / {formatCurrency(totalExpenseBudget, userCurrency)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    expenseProgress > 100 ? 'bg-destructive' : expenseProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(expenseProgress, 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Income Info */}
          {incomeBudgets.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">💰 Ingresos</span>
              <span className="font-medium text-green-600">
                {formatCurrency(totalIncomeReceived, userCurrency)} / {formatCurrency(totalIncomeBudget, userCurrency)}
              </span>
            </div>
          )}


        </CardContent>
      </Card>
    </Link>
  )
}

export default function BudgetIndex({ budgetPeriods }: Props) {
  const { auth } = usePage<SharedData>().props
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to start of day

  // Categorize periods
  const currentPeriods = budgetPeriods.filter((period: BudgetPeriod) => {
    const startDate = new Date(period.start_date)
    const endDate = new Date(period.end_date)
    return !(today < startDate) && !(today > endDate)
  })

  const upcomingPeriods = budgetPeriods.filter((period: BudgetPeriod) => {
    const startDate = new Date(period.start_date)
    return today < startDate
  })

  const pastPeriods = budgetPeriods.filter((period: BudgetPeriod) => {
    const endDate = new Date(period.end_date)
    return today > endDate
  })

  return (
    <AppLayout title="Presupuestos">
      <Head title="Presupuestos" />

      <div className="mx-auto w-full max-w-4xl p-4">
                <motion.div
                    className="mb-8 flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900">
                            Presupuestos
                        </h1>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.2 }}
                    >
                        <Button
                            variant="default"
                            asChild
                            className="rounded-full bg-blue-600 hover:bg-blue-700"
                        >
                            <Link href='/budget-periods/create' className="gap-2">
                                <PlusIcon className="h-4 w-4" />
                                Nuevo presupuesto
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>


        {/* Current Periods */}
        {currentPeriods.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Presupuestos activos</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentPeriods.map((period) => (
                <motion.div
                  key={period.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <BudgetPeriodCard period={period} userCurrency={auth.user.currency} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Periods */}
        {upcomingPeriods.length > 0 && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">Próximos presupuestos</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingPeriods.map((period) => (
                <motion.div
                  key={period.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <BudgetPeriodCard period={period} userCurrency={auth.user.currency} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Past Periods */}
        {pastPeriods.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Períodos Pasados</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastPeriods.map((period) => (
                <motion.div
                  key={period.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <BudgetPeriodCard period={period} userCurrency={auth.user.currency} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {budgetPeriods.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay Presupuestos aún</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer presupuesto para comenzar a rastrear tus gastos por categorías.
            </p>
            <Link href="/budget-periods/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Crear
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}