import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import type { Budget, Category, SharedData } from '@/types/index'
import { formatCurrency } from '@/utils/currency'

import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  budget: Budget
  categories: Category[]
}

export default function EditBudget({ budget, categories }: Props) {
  const { auth } = usePage<SharedData>().props

  const form = useForm({
    name: budget.name,
    amount: budget.amount,
    description: budget.description || '',
    category_id: budget.category_id,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.put(route('budgets.update', budget.id), {
      onSuccess: () => {
        // Success handled by redirect
      }
    })
  }

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.')) {
      form.delete(route('budgets.destroy', budget.id))
    }
  }

  const selectedCategory = categories.find(cat => cat.id === form.data.category_id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <AppLayout title={`Editar ${budget.name}`}>
      <Head title={`Editar ${budget.name}`} />

            <div className="mx-auto w-full max-w-4xl p-4">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Link href={`/budgets/${budget.id}`}>
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
                {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={form.processing}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Budget Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Presupuesto</CardTitle>
              <CardDescription>Información básica del presupuesto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Presupuesto</Label>
                <Input
                  id="name"
                  value={form.data.name}
                  onChange={(e) => form.setData('name', e.target.value)}
                  placeholder="Ej: Presupuesto para comida"
                  className="h-12 text-base"
                />
                {form.errors.name && (
                  <p className="text-sm text-red-600">{form.errors.name}</p>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <div className="flex items-center gap-4">
                  {selectedCategory && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg"
                    >
                      <span className="text-lg">{selectedCategory.emoji}</span>
                      <span className="font-medium">{selectedCategory.name}</span>
                    </motion.div>
                  )}
                  
                  <Select
                    value={form.data.category_id}
                    onValueChange={(value) => form.setData('category_id', value)}
                  >
                    <SelectTrigger className="h-12 flex-1">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.emoji}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.errors.category_id && (
                  <p className="text-sm text-red-600">{form.errors.category_id}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={form.data.description}
                  onChange={(e) => form.setData('description', e.target.value)}
                  placeholder="Añade una descripción para este presupuesto"
                  className="min-h-[100px] text-base resize-none"
                />
                {form.errors.description && (
                  <p className="text-sm text-red-600">{form.errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget Amount */}
          <Card>
            <CardHeader>
              <CardTitle>Monto del Presupuesto</CardTitle>
              <CardDescription>Establece el límite de gasto para este presupuesto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto Presupuestado</Label>
                  <div className="relative">
                    <motion.div
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xl"
                      initial={{ x: -5, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      {auth.user.currency.symbol}
                    </motion.div>
                    <CurrencyInput
                      id="amount"
                      currency={{
                        symbol: auth.user.currency.symbol,
                        decimalSeparator: auth.user.currency.decimal_separator,
                        thousandsSeparator: auth.user.currency.thousands_separator,
                        decimalPlaces: auth.user.currency.decimal_places,
                      }}
                      value={form.data.amount}
                      onChange={(value) => form.setData('amount', value)}
                      className="pl-12 h-16 text-2xl font-medium"
                      allowNegative={false}
                    />
                  </div>
                  {form.errors.amount && (
                    <p className="text-sm text-red-600">{form.errors.amount}</p>
                  )}
                </div>

                {/* Current vs New Amount Comparison */}
                {form.data.amount !== budget.amount && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">Monto actual:</span>
                      <span className="font-medium text-blue-900">
                        {formatCurrency(budget.amount, auth.user.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-blue-700">Nuevo monto:</span>
                      <span className="font-medium text-blue-900">
                        {formatCurrency(form.data.amount, auth.user.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-blue-200">
                      <span className="text-blue-700 font-medium">Diferencia:</span>
                      <span className={`font-bold ${
                        form.data.amount > budget.amount ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {form.data.amount > budget.amount ? '+' : ''}
                        {formatCurrency(form.data.amount - budget.amount, auth.user.currency)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Link href={`/budgets/${budget.id}`}>
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