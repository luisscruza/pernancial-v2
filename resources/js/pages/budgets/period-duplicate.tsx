import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Copy, Save, Trash2 } from 'lucide-react'
import type { BudgetPeriod, Category } from '@/types/index'

import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/ui/currency-input'

interface Props {
  originalPeriod: BudgetPeriod
  categories: Category[]
  budgetData: Record<string, { amount: number; category_id: number }>
}

export default function DuplicateBudgetPeriod({ originalPeriod, categories, budgetData }: Props) {
  const { auth } = usePage<{
    auth: {
      user: {
        currency: {
          symbol: string
          decimal_separator: string
          thousands_separator: string
          decimal_places: number
        }
      }
    }
  }>().props

  const form = useForm({
    name: `${originalPeriod.name} - Copia`,
    start_date: '',
    end_date: '',
    budgets: budgetData,
    type: originalPeriod.type as 'monthly' | 'weekly' | 'yearly' | 'custom',
  })

  // Calculate dates for next month by default
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)

  // Set default dates if not already set
  if (!form.data.start_date) {
    form.setData('start_date', nextMonth.toISOString().split('T')[0])
  }
  if (!form.data.end_date) {
    form.setData('end_date', endOfNextMonth.toISOString().split('T')[0])
  }

  const categoriesWithBudgets = categories.filter(category => 
    form.data.budgets[category.id]
  )

  const setBudgetAmount = (categoryId: string, amount: number) => {
    form.setData('budgets', {
      ...form.data.budgets,
      [categoryId]: {
        ...form.data.budgets[categoryId],
        amount,
      },
    })
  }

  const removeBudget = (categoryId: string) => {
    const newBudgets = { ...form.data.budgets }
    delete newBudgets[categoryId]
    form.setData('budgets', newBudgets)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post(route('budget-periods.store'))
  }

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    form.setData(field, value)
    
    // Auto-calculate end date when start date changes
    if (field === 'start_date' && value) {
      try {
        const startDate = new Date(value)
        if (!isNaN(startDate.getTime())) {
          const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
          form.setData('end_date', endDate.toISOString().split('T')[0])
        }
      } catch (error) {
        console.warn('Error calculating end date:', error)
      }
    }
  }

  return (
    <AppLayout title={`Duplicar - ${originalPeriod.name}`}>
      <Head title={`Duplicar - ${originalPeriod.name}`} />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={route('budget-periods.show', originalPeriod.id)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <Copy className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Duplicar presupuesto</h1>
              <p className="text-muted-foreground">
                Crea un nuevo período basado en: <span className="font-medium">{originalPeriod.name}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Nuevo Período</CardTitle>
                <CardDescription>
                  Configura los detalles básicos del período duplicado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Período</Label>
                  <Input
                    id="name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    className="mt-1"
                    placeholder="Ej: Enero 2024"
                  />
                  {form.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{form.errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Fecha de Inicio</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={form.data.start_date}
                      onChange={(e) => handleDateChange('start_date', e.target.value)}
                      className="mt-1"
                    />
                    {form.errors.start_date && (
                      <p className="text-sm text-red-600 mt-1">{form.errors.start_date}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="end_date">Fecha de Fin</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={form.data.end_date}
                      onChange={(e) => form.setData('end_date', e.target.value)}
                      className="mt-1"
                    />
                    {form.errors.end_date && (
                      <p className="text-sm text-red-600 mt-1">{form.errors.end_date}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Presupuestos por Categoría</CardTitle>
                <CardDescription>
                  Ajusta los montos para cada categoría (copiados del período original)
                </CardDescription>
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
                                      Gasto mensual
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
                                      Ingreso esperado
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

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <Link
                href={route('budget-periods.show', originalPeriod.id)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </Link>
              <Button type="submit" disabled={form.processing}>
                <Save className="w-4 h-4 mr-2" />
                {form.processing ? 'Creando...' : 'Crear Período Duplicado'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  )
}