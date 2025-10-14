import AppLayout from '@/layouts/app-layout';
import { Category, SharedData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

import { CurrencyInput } from '@/components/ui/currency-input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PlusIcon, CalendarIcon, TrendingUpIcon, TargetIcon } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

type BudgetType = 'period' | 'one_time';
type PeriodType = 'monthly' | 'weekly' | 'yearly' | 'custom';

const BUDGET_TYPES = [
    {
        value: 'period' as BudgetType,
        label: 'Presupuesto Recurrente',
        emoji: '📅',
        description: 'Se renueva automáticamente cada período (mensual, semanal, etc.)'
    },
    {
        value: 'one_time' as BudgetType,
        label: 'Presupuesto Único',
        emoji: '🎯',
        description: 'Para un período específico con fechas personalizadas'
    }
];

const PERIOD_TYPES = [
    {
        value: 'monthly' as PeriodType,
        label: 'Mensual',
        emoji: '📆',
    },
    {
        value: 'weekly' as PeriodType,
        label: 'Semanal',
        emoji: '📝',
    },
    {
        value: 'yearly' as PeriodType,
        label: 'Anual',
        emoji: '🗓️',
    },
    {
        value: 'custom' as PeriodType,
        label: 'Personalizado',
        emoji: '⚙️',
    }
];

interface CreateBudgetPageProps {
    categories: Category[];
}

export default function CreateBudgetPage({ categories }: CreateBudgetPageProps) {
    const [step, setStep] = useState<'type' | 'category' | 'details'>('type');
    const { auth } = usePage<SharedData>().props;
    const userCurrency = auth.user.currency;

    const form = useForm({
        name: '',
        amount: 0,
        type: '' as BudgetType | '',
        period_type: 'monthly' as PeriodType,
        category_id: '',
        start_date: '',
        end_date: '',
        description: '',
    });

    // Auto-generate dates based on period type
    useEffect(() => {
        if (form.data.type === 'period' && form.data.period_type) {
            const now = new Date();
            let startDate = new Date();
            let endDate = new Date();

            switch (form.data.period_type) {
                case 'monthly':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    break;
                case 'weekly': {
                    const dayOfWeek = now.getDay();
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - dayOfWeek);
                    endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 6);
                    break;
                }
                case 'yearly':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    endDate = new Date(now.getFullYear(), 11, 31);
                    break;
                case 'custom':
                    // Don't auto-set for custom
                    return;
            }

            form.setData(data => ({
                ...data,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0]
            }));
        }
    }, [form.data.type, form.data.period_type]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-generate budget name
    useEffect(() => {
        if (form.data.category_id && form.data.period_type) {
            const selectedCategory = categories.find(c => c.id === form.data.category_id);
            if (selectedCategory) {
                const periodLabels = {
                    monthly: 'Mensual',
                    weekly: 'Semanal',
                    yearly: 'Anual',
                    custom: 'Personalizado'
                };
                
                const name = `${selectedCategory.name} - ${periodLabels[form.data.period_type]}`;
                form.setData('name', name);
            }
        }
    }, [form.data.category_id, form.data.period_type, categories]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleContinue = () => {
        if (step === 'type' && form.data.type) {
            setStep('category');
        } else if (step === 'category' && form.data.category_id) {
            setStep('details');
        }
    };

    const handleBack = () => {
        if (step === 'details') {
            setStep('category');
        } else if (step === 'category') {
            setStep('type');
        }
    };

    const canContinue = () => {
        if (step === 'type') return !!form.data.type;
        if (step === 'category') return !!form.data.category_id;
        if (step === 'details') {
            return !!(
                form.data.name.trim() &&
                form.data.amount > 0 &&
                form.data.start_date &&
                form.data.end_date
            );
        }
        return false;
    };

    const handleSubmit = () => {
        if (step === 'details') {
            form.post(route('budgets.store'), {
                onSuccess: () => {
                    // Success will be handled by redirect
                }
            });
        }
    };

    const selectedBudgetType = BUDGET_TYPES.find(t => t.value === form.data.type);
    const selectedCategory = categories.find(c => c.id === form.data.category_id);
    const selectedPeriodType = PERIOD_TYPES.find(p => p.value === form.data.period_type);

    return (
        <AppLayout title="Crear presupuesto">
            <Head title="Crear presupuesto" />
            <div className="mx-auto w-full max-w-2xl p-4">
                {/* Header */}
                <motion.div
                    className="mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('budgets.index')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear nuevo presupuesto</h1>
                        <p className="text-gray-600">
                            {step === 'type' && 'Selecciona el tipo de presupuesto'}
                            {step === 'category' && 'Elige la categoría para tu presupuesto'}
                            {step === 'details' && 'Configura los detalles de tu presupuesto'}
                        </p>
                    </div>
                </motion.div>

                {/* Progress indicator */}
                <motion.div
                    className="mb-8 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-2">
                        {['type', 'category', 'details'].map((stepName, index) => (
                            <div key={stepName} className="flex items-center">
                                <div
                                    className={`h-2 w-8 rounded-full transition-colors ${
                                        step === stepName || ['type', 'category', 'details'].indexOf(step) > index
                                            ? 'bg-primary' 
                                            : 'bg-gray-200'
                                    }`}
                                />
                                {index < 2 && <div className="h-px w-4 bg-gray-200" />}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Content */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 'type' && (
                            <motion.div
                                key="type"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <RadioGroup
                                    value={form.data.type}
                                    onValueChange={(value) => form.setData('type', value as BudgetType)}
                                    className="grid grid-cols-1 gap-4"
                                >
                                    {BUDGET_TYPES.map((budgetType) => (
                                        <motion.div
                                            key={budgetType.value}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="relative">
                                                <RadioGroupItem
                                                    value={budgetType.value}
                                                    id={budgetType.value}
                                                    className="peer absolute right-4 top-1/2 -translate-y-1/2"
                                                />
                                                <Label
                                                    htmlFor={budgetType.value}
                                                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 p-6 
                                                        hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                >
                                                    <div className="text-3xl">{budgetType.emoji}</div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">{budgetType.label}</div>
                                                        <div className="text-sm text-gray-500">{budgetType.description}</div>
                                                    </div>
                                                </Label>
                                            </div>
                                        </motion.div>
                                    ))}
                                </RadioGroup>

                                {/* Period Type Selection - Only show for period budgets */}
                                {form.data.type === 'period' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <Label className="text-lg font-medium">Tipo de período</Label>
                                        <RadioGroup
                                            value={form.data.period_type}
                                            onValueChange={(value) => form.setData('period_type', value as PeriodType)}
                                            className="grid grid-cols-2 gap-3"
                                        >
                                            {PERIOD_TYPES.map((periodType) => (
                                                <motion.div
                                                    key={periodType.value}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <div className="relative">
                                                        <RadioGroupItem
                                                            value={periodType.value}
                                                            id={periodType.value}
                                                            className="peer absolute right-2 top-1/2 -translate-y-1/2"
                                                        />
                                                        <Label
                                                            htmlFor={periodType.value}
                                                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 
                                                                hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                        >
                                                            <div className="text-xl">{periodType.emoji}</div>
                                                            <div className="font-medium text-gray-900">{periodType.label}</div>
                                                        </Label>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </RadioGroup>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {step === 'category' && (
                            <motion.div
                                key="category"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="text-lg font-medium">Tipo seleccionado</Label>
                                        {selectedBudgetType && (
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1"
                                            >
                                                <span>{selectedBudgetType.emoji}</span>
                                                <span>{selectedBudgetType.label}</span>
                                            </motion.div>
                                        )}
                                    </div>
                                    {form.data.type === 'period' && selectedPeriodType && (
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <span>{selectedPeriodType.emoji}</span>
                                            <span>Período: {selectedPeriodType.label}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-lg font-medium">Categoría</Label>
                                    <RadioGroup
                                        value={form.data.category_id}
                                        onValueChange={(value) => form.setData('category_id', value)}
                                        className="grid grid-cols-1 gap-3"
                                    >
                                        {categories.map((category) => (
                                            <motion.div
                                                key={category.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="relative">
                                                    <RadioGroupItem
                                                        value={category.id}
                                                        id={category.id}
                                                        className="peer absolute right-4 top-1/2 -translate-y-1/2"
                                                    />
                                                    <Label
                                                        htmlFor={category.id}
                                                        className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 p-4 
                                                            hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                    >
                                                        <div className="text-2xl">{category.emoji}</div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">{category.name}</div>
                                                            <div className="text-sm text-gray-500 capitalize">{category.type}</div>
                                                        </div>
                                                    </Label>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </motion.div>
                        )}

                        {step === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Summary */}
                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="text-lg font-medium">Resumen</Label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <TrendingUpIcon className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">Tipo:</span>
                                            <span className="font-medium">{selectedBudgetType?.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TargetIcon className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">Categoría:</span>
                                            <span className="font-medium">{selectedCategory?.name}</span>
                                        </div>
                                        {form.data.type === 'period' && (
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                                <span className="text-gray-600">Período:</span>
                                                <span className="font-medium">{selectedPeriodType?.label}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Budget Details */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-base font-medium">Nombre del presupuesto</Label>
                                            <Input
                                                id="name"
                                                placeholder="Ej: Supermercado - Mensual"
                                                value={form.data.name}
                                                onChange={(e) => form.setData('name', e.target.value)}
                                                className="h-12"
                                            />
                                            {form.errors.name && (
                                                <p className="text-sm text-red-600">{form.errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="amount" className="text-base font-medium">Monto del presupuesto</Label>
                                            <CurrencyInput
                                                id="amount"
                                                value={form.data.amount}
                                                onChange={(value) => form.setData('amount', value || 0)}
                                                currency={{
                                                    symbol: userCurrency.symbol,
                                                    decimalSeparator: userCurrency.decimal_separator,
                                                    thousandsSeparator: userCurrency.thousands_separator,
                                                    decimalPlaces: userCurrency.decimal_places
                                                }}
                                                className="h-12"
                                            />
                                            {form.errors.amount && (
                                                <p className="text-sm text-red-600">{form.errors.amount}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="start_date" className="text-base font-medium">Fecha de inicio</Label>
                                                <Input
                                                    type="date"
                                                    id="start_date"
                                                    value={form.data.start_date}
                                                    onChange={(e) => form.setData('start_date', e.target.value)}
                                                    className="h-12"
                                                />
                                                {form.errors.start_date && (
                                                    <p className="text-sm text-red-600">{form.errors.start_date}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="end_date" className="text-base font-medium">Fecha de fin</Label>
                                                <Input
                                                    type="date"
                                                    id="end_date"
                                                    value={form.data.end_date}
                                                    onChange={(e) => form.setData('end_date', e.target.value)}
                                                    className="h-12"
                                                />
                                                {form.errors.end_date && (
                                                    <p className="text-sm text-red-600">{form.errors.end_date}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-base font-medium">Descripción (opcional)</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Añade notas o detalles sobre este presupuesto..."
                                                value={form.data.description}
                                                onChange={(e) => form.setData('description', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer with navigation buttons */}
                <motion.div
                    className="mt-8 flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {step !== 'type' && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex-1"
                        >
                            Atrás
                        </Button>
                    )}
                    <Button
                        onClick={step === 'details' ? handleSubmit : handleContinue}
                        disabled={!canContinue() || form.processing}
                        className="flex-1 gap-2"
                    >
                        {form.processing ? (
                            'Creando...'
                        ) : step === 'details' ? (
                            <>
                                <PlusIcon className="h-4 w-4" />
                                Crear presupuesto
                            </>
                        ) : (
                            'Continuar'
                        )}
                    </Button>
                </motion.div>
            </div>
        </AppLayout>
    );
}