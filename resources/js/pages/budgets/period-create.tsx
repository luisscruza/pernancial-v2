import type { Category, SharedData } from '@/types/index';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckSquare, DollarSign, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

interface Props {
    categories: Category[];
}

interface BudgetFormData {
    category_id: string;
    amount: number;
}

type PeriodFormData = {
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    budgets: BudgetFormData[];
};

export default function BudgetPeriodCreate({ categories }: Props) {
    const { auth } = usePage<SharedData>().props;
    const userCurrency = auth.user.currency;
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [data, setDataState] = useState<PeriodFormData>({
        name: '',
        type: 'monthly',
        start_date: '',
        end_date: '',
        budgets: [],
    });

    const setData = (key: keyof PeriodFormData, value: unknown) => {
        setDataState((prev) => ({ ...prev, [key]: value }));
    };

    const handleTypeChange = (type: string) => {
        setData('type', type);
    };

    const selectAllCategories = () => {
        const allCategoryIds = new Set(categories.map((cat) => cat.id));
        setSelectedCategories(allCategoryIds);

        const allBudgets = categories.map((cat) => ({ category_id: cat.id, amount: 0 }));
        setData('budgets', allBudgets);
    };

    const clearAllCategories = () => {
        setSelectedCategories(new Set());
        setData('budgets', []);
    };

    const handleStartDateChange = (startDate: string) => {
        setData('start_date', startDate);
    };

    const addCategory = (categoryId: string) => {
        if (!categoryId || selectedCategories.has(categoryId)) return;

        const newSelectedCategories = new Set(selectedCategories);
        newSelectedCategories.add(categoryId);
        setSelectedCategories(newSelectedCategories);

        const newBudgets = [...data.budgets, { category_id: categoryId, amount: 0 }];
        setData('budgets', newBudgets);
    };

    const removeCategory = (categoryId: string) => {
        const newSelectedCategories = new Set(selectedCategories);
        newSelectedCategories.delete(categoryId);
        setSelectedCategories(newSelectedCategories);

        const newBudgets = data.budgets.filter((budget) => budget.category_id !== categoryId);
        setData('budgets', newBudgets);
    };

    const updateBudgetAmount = (categoryId: string, amount: number) => {
        const newBudgets = data.budgets.map((budget) => (budget.category_id === categoryId ? { ...budget, amount } : budget));
        setData('budgets', newBudgets);
    };

    const getCategoryById = (id: string) => {
        return categories.find((cat) => cat.id === id);
    };

    const availableCategories = categories.filter((cat) => !selectedCategories.has(cat.id));
    const totalBudget = data.budgets.reduce((sum, budget) => sum + budget.amount, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.post('/budget-periods', data as any, {
            onSuccess: () => {
                // Will redirect automatically
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <AppLayout title="Nuevo presupuesto">
            <Head title="Nuevo presupuesto" />

            <div className="ml-8 w-full max-w-7xl p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/budgets">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nuevo presupuesto</h1>
                    <p className="text-muted-foreground mt-2">Configura un nuevo presupuesto y asigna montos a diferentes categorías</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Period Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles del Período</CardTitle>
                            <CardDescription>Define la información básica para tu presupuesto</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Period Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del Período</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="ej., Presupuesto Enero 2025"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                </div>

                                {/* Period Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo de Período</Label>
                                    <Select value={data.type} onValueChange={handleTypeChange}>
                                        <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Seleccionar tipo de período" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">Semanal</SelectItem>
                                            <SelectItem value="monthly">Mensual</SelectItem>
                                            <SelectItem value="yearly">Anual</SelectItem>
                                            <SelectItem value="custom">Personalizado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Start Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Fecha de Inicio</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        className={errors.start_date ? 'border-destructive' : ''}
                                    />
                                    {errors.start_date && <p className="text-destructive text-sm">{errors.start_date}</p>}
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Fecha de finalización</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className={errors.end_date ? 'border-destructive' : ''}
                                    />
                                    {errors.end_date && <p className="text-destructive text-sm">{errors.end_date}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Budgets */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Presupuestos</CardTitle>
                                    <CardDescription>Selecciona categorías y establece montos de presupuesto para cada una</CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-muted-foreground text-sm">Presupuesto total</div>
                                    <div className="text-2xl font-bold">{formatCurrency(totalBudget, userCurrency)}</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add Category Controls */}
                            {availableCategories.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Agregar categorías</Label>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={selectAllCategories}
                                                className="flex items-center gap-2"
                                            >
                                                <CheckSquare className="h-4 w-4" />
                                                Seleccionar todas
                                            </Button>
                                            {selectedCategories.size > 0 && (
                                                <Button type="button" variant="outline" size="sm" onClick={clearAllCategories}>
                                                    Limpiar Todo
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <Select value="" onValueChange={addCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar una categoría para agregar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCategories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{category.emoji}</span>
                                                        <span>{category.name}</span>
                                                        <Badge variant="outline" className="ml-auto">
                                                            {category.type === 'expense' ? 'Gasto' : 'Ingreso'}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Selected Categories */}
                            <div className="space-y-6">
                                {/* Expense Categories */}
                                {data.budgets.some((budget) => {
                                    const category = getCategoryById(budget.category_id);
                                    return category?.type === 'expense';
                                }) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-red-600">📉 Gastos</h3>
                                            <Badge variant="outline" className="border-red-200">
                                                {
                                                    data.budgets.filter((budget) => {
                                                        const category = getCategoryById(budget.category_id);
                                                        return category?.type === 'expense';
                                                    }).length
                                                }{' '}
                                                categorías
                                            </Badge>
                                        </div>
                                        <div className="space-y-3 border-l-2 border-red-200 pl-4">
                                            <AnimatePresence>
                                                {data.budgets.map((budget) => {
                                                    const category = getCategoryById(budget.category_id);
                                                    if (!category || category.type !== 'expense') return null;

                                                    return (
                                                        <motion.div
                                                            key={budget.category_id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="flex items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-4"
                                                        >
                                                            <div className="flex flex-1 items-center gap-3">
                                                                <span className="text-2xl">{category.emoji}</span>
                                                                <div>
                                                                    <div className="font-medium">{category.name}</div>
                                                                    <div className="text-xs text-red-600">Gasto</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="text-muted-foreground h-4 w-4" />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    value={budget.amount || ''}
                                                                    onChange={(e) =>
                                                                        updateBudgetAmount(budget.category_id, parseFloat(e.target.value) || 0)
                                                                    }
                                                                    className="w-32"
                                                                    min="0"
                                                                    step="0.01"
                                                                />
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeCategory(budget.category_id)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Income Categories */}
                                {data.budgets.some((budget) => {
                                    const category = getCategoryById(budget.category_id);
                                    return category?.type === 'income';
                                }) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-green-600">📈 Ingresos</h3>
                                            <Badge variant="outline" className="border-green-200">
                                                {
                                                    data.budgets.filter((budget) => {
                                                        const category = getCategoryById(budget.category_id);
                                                        return category?.type === 'income';
                                                    }).length
                                                }{' '}
                                                categorías
                                            </Badge>
                                        </div>
                                        <div className="space-y-3 border-l-2 border-green-200 pl-4">
                                            <AnimatePresence>
                                                {data.budgets.map((budget) => {
                                                    const category = getCategoryById(budget.category_id);
                                                    if (!category || category.type !== 'income') return null;

                                                    return (
                                                        <motion.div
                                                            key={budget.category_id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4"
                                                        >
                                                            <div className="flex flex-1 items-center gap-3">
                                                                <span className="text-2xl">{category.emoji}</span>
                                                                <div>
                                                                    <div className="font-medium">{category.name}</div>
                                                                    <div className="text-xs text-green-600">Ingreso</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="text-muted-foreground h-4 w-4" />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    value={budget.amount || ''}
                                                                    onChange={(e) =>
                                                                        updateBudgetAmount(budget.category_id, parseFloat(e.target.value) || 0)
                                                                    }
                                                                    className="w-32"
                                                                    min="0"
                                                                    step="0.01"
                                                                />
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeCategory(budget.category_id)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {data.budgets.length === 0 && (
                                    <div className="text-muted-foreground py-8 text-center">
                                        <DollarSign className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                        <p>No hay categorías seleccionadas aún</p>
                                        <p className="text-sm">Elige categorías arriba para establecer presupuestos</p>
                                    </div>
                                )}
                            </div>

                            {errors.budgets && <p className="text-destructive text-sm">{errors.budgets}</p>}
                        </CardContent>
                    </Card>

                    {/* Summary & Actions */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-muted-foreground text-sm">{data.budgets.length} categorías seleccionadas</div>
                                    <div className="text-2xl font-bold">Total: {formatCurrency(totalBudget, userCurrency)}</div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href="/budgets">
                                        <Button type="button" variant="outline">
                                            Cancelar
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing || data.budgets.length === 0 || !data.name || !data.start_date || !data.end_date}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing ? 'Creando...' : 'Crear'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
