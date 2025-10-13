import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SaveIcon, CoinsIcon, PlusIcon, CalendarIcon, TrashIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Currency } from '@/types';
import { useState } from 'react';

const SYMBOL_POSITIONS = [
    { value: 'before', label: 'Antes ($100)', description: 'El símbolo va antes del monto' },
    { value: 'after', label: 'Después (100$)', description: 'El símbolo va después del monto' }
];

const SEPARATORS = [
    { value: '.', label: 'Punto (.)' },
    { value: ',', label: 'Coma (,)' }
];

interface CurrencyRate {
    id?: number;
    rate: number;
    effective_date: string;
    created_at?: string;
}

interface Props {
    currency: Currency & {
        conversion_rate: number;
        is_base: boolean;
        rates: CurrencyRate[];
    };
}

export default function EditCurrency({ currency }: Props) {
    const [newRate, setNewRate] = useState({ rate: '', effective_date: '' });
    const [historicalRates, setHistoricalRates] = useState<CurrencyRate[]>(
        currency.rates || []
    );

    const form = useForm({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        decimal_places: currency.decimal_places,
        decimal_separator: currency.decimal_separator,
        thousands_separator: currency.thousands_separator,
        symbol_position: currency.symbol_position as 'before' | 'after',
        conversion_rate: currency.conversion_rate,
        is_base: currency.is_base as boolean,
    });

    const addNewRate = () => {
        if (newRate.rate && newRate.effective_date) {
            const rateData = {
                rate: parseFloat(newRate.rate),
                effective_date: newRate.effective_date,
            };

            router.post(route('currencies.rates.store', currency.id), rateData, {
                onSuccess: () => {
                    setNewRate({ rate: '', effective_date: '' });
                    // Refresh the page to show the new rate
                    window.location.reload();
                },
                onError: (errors) => {
                    console.error('Error adding rate:', errors);
                }
            });
        }
    };

    const removeRate = (index: number) => {
        const updatedRates = historicalRates.filter((_, i) => i !== index);
        setHistoricalRates(updatedRates);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatRate = (rate: number) => {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(rate);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('currencies.update', currency.id), {
            onSuccess: () => {
                // Success will be handled by redirect
            }
        });
    };

    const formatPreview = (amount: number) => {
        const formatted = amount.toFixed(form.data.decimal_places)
            .replace('.', form.data.decimal_separator);
        
        const parts = formatted.split(form.data.decimal_separator);
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, form.data.thousands_separator);
        
        const finalAmount = parts.join(form.data.decimal_separator);
        
        return form.data.symbol_position === 'before' 
            ? `${form.data.symbol}${finalAmount}`
            : `${finalAmount}${form.data.symbol}`;
    };

    return (
        <AppLayout title="Editar moneda">
            <Head title="Editar moneda" />
            <div className="mx-auto w-full max-w-2xl p-4">
                {/* Header */}
                <motion.div
                    className="mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('currencies.show', currency.id)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <CoinsIcon className="h-6 w-6 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Editar moneda</h1>
                            <p className="text-gray-600">
                                Modifica la información de {currency.code}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                            <h2 className="text-lg font-semibold mb-4">Información básica</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Código de la moneda</Label>
                                    <Input
                                        id="code"
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                        className="font-mono"
                                        maxLength={10}
                                    />
                                    {form.errors.code && (
                                        <p className="text-sm text-red-600">{form.errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="symbol">Símbolo</Label>
                                    <Input
                                        id="symbol"
                                        value={form.data.symbol}
                                        onChange={(e) => form.setData('symbol', e.target.value)}
                                        maxLength={10}
                                    />
                                    {form.errors.symbol && (
                                        <p className="text-sm text-red-600">{form.errors.symbol}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="name">Nombre de la moneda</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                    />
                                    {form.errors.name && (
                                        <p className="text-sm text-red-600">{form.errors.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Formatting */}
                        <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                            <h2 className="text-lg font-semibold mb-4">Formato de presentación</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="decimal_places">Decimales</Label>
                                    <Input
                                        id="decimal_places"
                                        type="number"
                                        min="0"
                                        max="8"
                                        value={form.data.decimal_places}
                                        onChange={(e) => form.setData('decimal_places', parseInt(e.target.value) || 0)}
                                    />
                                    {form.errors.decimal_places && (
                                        <p className="text-sm text-red-600">{form.errors.decimal_places}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Posición del símbolo</Label>
                                    <Select 
                                        value={form.data.symbol_position} 
                                        onValueChange={(value) => form.setData('symbol_position', value as 'before' | 'after')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SYMBOL_POSITIONS.map((position) => (
                                                <SelectItem key={position.value} value={position.value}>
                                                    {position.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Separador decimal</Label>
                                    <Select 
                                        value={form.data.decimal_separator} 
                                        onValueChange={(value) => form.setData('decimal_separator', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SEPARATORS.map((separator) => (
                                                <SelectItem key={separator.value} value={separator.value}>
                                                    {separator.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Separador de miles</Label>
                                    <Select 
                                        value={form.data.thousands_separator} 
                                        onValueChange={(value) => form.setData('thousands_separator', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SEPARATORS.map((separator) => (
                                                <SelectItem key={separator.value} value={separator.value}>
                                                    {separator.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Conversion Rate */}
                        <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                            <h2 className="text-lg font-semibold mb-4">Tasa de conversión</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="conversion_rate">Tasa actual</Label>
                                    <Input
                                        id="conversion_rate"
                                        type="number"
                                        step="0.000001"
                                        min="0.000001"
                                        value={form.data.conversion_rate}
                                        onChange={(e) => form.setData('conversion_rate', parseFloat(e.target.value) || 1)}
                                    />
                                    {form.errors.conversion_rate && (
                                        <p className="text-sm text-red-600">{form.errors.conversion_rate}</p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Cambiar esta tasa creará un nuevo registro en el historial.
                                    </p>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="is_base"
                                        checked={form.data.is_base}
                                        onCheckedChange={(checked) => {
                                            form.setData('is_base', Boolean(checked));
                                            if (checked) {
                                                form.setData('conversion_rate', 1);
                                            }
                                        }}
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="is_base" className="cursor-pointer">
                                            Establecer como moneda base
                                        </Label>
                                        <p className="text-sm text-gray-500">
                                            Solo puedes tener una moneda base.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Historical Conversion Rates */}
                        <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                            <h2 className="text-lg font-semibold mb-4">Historial de tasas de conversión</h2>
                            
                            {/* Add New Rate */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <CalendarIcon className="h-4 w-4" />
                                        Agregar nueva tasa
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_rate">Tasa</Label>
                                            <Input
                                                id="new_rate"
                                                type="number"
                                                step="0.000001"
                                                min="0.000001"
                                                placeholder="1.0000"
                                                value={newRate.rate}
                                                onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="effective_date">Fecha efectiva</Label>
                                            <Input
                                                id="effective_date"
                                                type="date"
                                                value={newRate.effective_date}
                                                onChange={(e) => setNewRate({ ...newRate, effective_date: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                onClick={addNewRate}
                                                disabled={!newRate.rate || !newRate.effective_date}
                                                className="w-full gap-2"
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                                Agregar
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Puedes agregar tasas históricas para fechas específicas. Esto es útil para mantener un registro preciso de los cambios de valor de la moneda.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Current Rates List */}
                            {historicalRates.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-700">Tasas registradas</h3>
                                    <AnimatePresence>
                                        {historicalRates
                                            .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime())
                                            .map((rate, index) => (
                                            <motion.div
                                                key={`${rate.effective_date}-${rate.rate}`}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="flex items-center justify-between rounded-lg border bg-white p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                        <span className="text-sm font-bold text-blue-600">
                                                            {currency.symbol}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{formatRate(rate.rate)}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(rate.effective_date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                            Más reciente
                                                        </span>
                                                    )}
                                                    {!rate.id && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeRate(index)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                            <h2 className="text-lg font-semibold text-blue-900 mb-4">Vista previa</h2>
                            <div className="space-y-2 text-blue-800">
                                <div className="flex justify-between">
                                    <span>Ejemplo pequeño:</span>
                                    <span className="font-bold">{formatPreview(25.5)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Ejemplo mediano:</span>
                                    <span className="font-bold">{formatPreview(1234.56)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Ejemplo grande:</span>
                                    <span className="font-bold">{formatPreview(1234567.89)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                        className="flex gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Button
                            variant="outline"
                            asChild
                            className="flex-1"
                        >
                            <Link href={route('currencies.show', currency.id)}>
                                Cancelar
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="flex-1 gap-2"
                        >
                            {form.processing ? (
                                'Guardando...'
                            ) : (
                                <>
                                    <SaveIcon className="h-4 w-4" />
                                    Guardar cambios
                                </>
                            )}
                        </Button>
                    </motion.div>
                </form>
            </div>
        </AppLayout>
    );
}