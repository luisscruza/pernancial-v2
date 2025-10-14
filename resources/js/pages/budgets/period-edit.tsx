import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import type { BudgetPeriod, Category, SharedData } from '@/types/index'
import { formatCurrency } from '@/utils/currency'

import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/ui/currency-input'

interface Props {
  budgetPeriod: BudgetPeriod
  categories: Category[]
}

export default function EditBudgetPeriod({ budgetPeriod, categories }: Props) {
  const { auth } = usePage<SharedData>().props

  // Initialize form data with existing budgets
  const initialBudgets: Record<string, { amount: number; category_id: string; budget_id?: number }> = {}
  budgetPeriod.budgets?.forEach(budget => {
    initialBudgets[budget.category_id] = {
      amount: budget.amount,
      category_id: budget.category_id,
      budget_id: budget.id
    }
  })

  const form = useForm({
    name: budgetPeriod.name,
    budgets: initialBudgets
  })

  const setBudgetAmount = (categoryId: string, amount: number) => {
    form.setData('budgets', {
      ...form.data.budgets,
      [categoryId]: {
        amount,
        category_id: categoryId,
        budget_id: form.data.budgets[categoryId]?.budget_id
      }
    })
  }

  const removeBudget = (categoryId: string) => {
    const newBudgets = { ...form.data.budgets }
    delete newBudgets[categoryId]
    form.setData('budgets', newBudgets)
  }

  const addBudget = (categoryId: string) => {
    setBudgetAmount(categoryId, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.put(route('budget-periods.update', budgetPeriod.id), {
      onSuccess: () => {
        // Success handled by redirect
      }
    })
  }

  const totalBudget = Object.values(form.data.budgets).reduce((sum, budget) => sum + Number(budget.amount || 0), 0)
  const categoriesWithBudgets = categories.filter(cat => form.data.budgets[cat.id])
  const categoriesWithoutBudgets = categories.filter(cat => !form.data.budgets[cat.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <AppLayout title={`Editar ${budgetPeriod.name}`}>
      <Head title={`Editar ${budgetPeriod.name}`} />

            <div className="mx-auto w-full max-w-4xl p-4">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Link href={`/budget-periods/${budgetPeriod.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Editar presupuesto</h1>
              <p className="text-muted-foreground">
                {formatDate(budgetPeriod.start_date)} - {formatDate(budgetPeriod.end_date)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Period Name */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Período</CardTitle>
              <CardDescription>Información básica del presupuesto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Período</Label>
                  <Input
                    id="name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    placeholder="Ej: Presupuesto Enero 2024"
                    className="mt-1"
                  />
                  {form.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{form.errors.name}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Presupuesto</CardTitle>
              <CardDescription>Total presupuestado en todas las categorías</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(totalBudget, auth.user.currency)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {categoriesWithBudgets.length} categorías con presupuesto
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Existing Budgets */}
          {categoriesWithBudgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Presupuestos por Categoría</CardTitle>
                <CardDescription>Ajusta los montos para cada categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Expense Categories */}
                  {categoriesWithBudgets.some(cat => cat.type === 'expense') && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-red-600">📉 Gastos</h3>
                        <Badge variant="outline" className="border-red-200">
                          {categoriesWithBudgets.filter(cat => cat.type === 'expense').length} categorías
                        </Badge>
                      </div>
                      <div className="space-y-3 pl-4 border-l-2 border-red-200">
                        <AnimatePresence>
                          {categoriesWithBudgets.filter(cat => cat.type === 'expense').map((category, index) => {
                            const budget = form.data.budgets[category.id]
                            return (
                              <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="text-2xl">{category.emoji}</span>
                                  <div>
                                    <div className="font-medium">{category.name}</div>
                                    <div className="text-xs text-red-600">
                                      {budget.budget_id ? 'Presupuesto existente' : 'Nuevo presupuesto'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="relative w-40">
                                    <motion.div
                                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium"
                                      initial={{ x: -5, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                    >
                                      {auth.user.currency.symbol}
                                    </motion.div>
                                    <CurrencyInput
                                      currency={{
                                        symbol: auth.user.currency.symbol,
                                        decimalSeparator: auth.user.currency.decimal_separator,
                                        thousandsSeparator: auth.user.currency.thousands_separator,
                                        decimalPlaces: auth.user.currency.decimal_places,
                                      }}
                                      value={budget.amount}
                                      onChange={(value) => setBudgetAmount(category.id, value)}
                                      className="pl-8 h-10"
                                      allowNegative={false}
                                    />
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBudget(category.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* Income Categories */}
                  {categoriesWithBudgets.some(cat => cat.type === 'income') && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-green-600">📈 Ingresos</h3>
                        <Badge variant="outline" className="border-green-200">
                          {categoriesWithBudgets.filter(cat => cat.type === 'income').length} categorías
                        </Badge>
                      </div>
                      <div className="space-y-3 pl-4 border-l-2 border-green-200">
                        <AnimatePresence>
                          {categoriesWithBudgets.filter(cat => cat.type === 'income').map((category, index) => {
                            const budget = form.data.budgets[category.id]
                            return (
                              <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="text-2xl">{category.emoji}</span>
                                  <div>
                                    <div className="font-medium">{category.name}</div>
                                    <div className="text-xs text-green-600">
                                      {budget.budget_id ? 'Presupuesto existente' : 'Nuevo presupuesto'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="relative w-40">
                                    <motion.div
                                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium"
                                      initial={{ x: -5, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                    >
                                      {auth.user.currency.symbol}
                                    </motion.div>
                                    <CurrencyInput
                                      currency={{
                                        symbol: auth.user.currency.symbol,
                                        decimalSeparator: auth.user.currency.decimal_separator,
                                        thousandsSeparator: auth.user.currency.thousands_separator,
                                        decimalPlaces: auth.user.currency.decimal_places,
                                      }}
                                      value={budget.amount}
                                      onChange={(value) => setBudgetAmount(category.id, value)}
                                      className="pl-8 h-10"
                                      allowNegative={false}
                                    />
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBudget(category.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add More Categories */}
          {categoriesWithoutBudgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Más Categorías</CardTitle>
                <CardDescription>Selecciona categorías adicionales para presupuestar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {categoriesWithoutBudgets.map((category, index) => (
                    <motion.button
                      key={category.id}
                      type="button"
                      onClick={() => addBudget(category.id)}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg">{category.emoji}</span>
                      <span className="font-medium">{category.name}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Link href={`/budget-periods/${budgetPeriod.id}`}>
              <Button variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={form.processing}
              className="gap-2"
            >
              {form.processing ? (
                'Guardando...'
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}