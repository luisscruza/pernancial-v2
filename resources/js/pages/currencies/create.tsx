import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PlusIcon, CoinsIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

const SYMBOL_POSITIONS = [
    { value: 'before', label: 'Antes ($100)', description: 'El símbolo va antes del monto' },
    { value: 'after', label: 'Después (100$)', description: 'El símbolo va después del monto' }
];

const SEPARATORS = [
    { value: '.', label: 'Punto (.)' },
    { value: ',', label: 'Coma (,)' }
];

export default function CreateCurrency() {
    const [step, setStep] = useState<'basic' | 'formatting' | 'conversion'>('basic');

    const form = useForm({
        code: '',
        name: '',
        symbol: '',
        decimal_places: 2,
        decimal_separator: '.',
        thousands_separator: ',',
        symbol_position: 'before' as 'before' | 'after',
        conversion_rate: 1,
        is_base: false as boolean,
    });

    const handleContinue = () => {
        if (step === 'basic' && form.data.code && form.data.name && form.data.symbol) {
            setStep('formatting');
        } else if (step === 'formatting') {
            setStep('conversion');
        }
    };

    const handleBack = () => {
        if (step === 'conversion') {
            setStep('formatting');
        } else if (step === 'formatting') {
            setStep('basic');
        }
    };

    const canContinue = () => {
        if (step === 'basic') {
            return !!form.data.code.trim() && !!form.data.name.trim() && !!form.data.symbol.trim();
        }
        if (step === 'formatting') {
            return form.data.decimal_places >= 0 && form.data.decimal_places <= 8;
        }
        if (step === 'conversion') {
            return form.data.conversion_rate > 0;
        }
        return false;
    };

    const handleSubmit = () => {
        if (step === 'conversion') {
            form.post(route('currencies.store'), {
                onSuccess: () => {
                    // Success will be handled by redirect
                }
            });
        }
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
        <AppLayout title="Crear moneda">
            <Head title="Crear moneda" />
            <div className="mx-auto w-full max-w-2xl p-4">
                {/* Header */}
                <motion.div
                    className="mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('currencies.index')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <CoinsIcon className="h-6 w-6 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Crear nueva moneda</h1>
                            <p className="text-gray-600">
                                {step === 'basic' && 'Información básica de la moneda'}
                                {step === 'formatting' && 'Configurar formato de presentación'}
                                {step === 'conversion' && 'Establecer tasa de conversión'}
                            </p>
                        </div>
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
                        {['basic', 'formatting', 'conversion'].map((stepName, index) => (
                            <div key={stepName} className="flex items-center">
                                <div
                                    className={`h-2 w-8 rounded-full transition-colors ${
                                        step === stepName || ['basic', 'formatting', 'conversion'].indexOf(step) > index
                                            ? 'bg-blue-600' 
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
                        {step === 'basic' && (
                            <motion.div
                                key="basic"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <Label htmlFor="code" className="text-lg font-medium">Código de la moneda</Label>
                                        <Input
                                            id="code"
                                            placeholder="USD, EUR, COP..."
                                            value={form.data.code}
                                            onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                            className="h-12 text-base font-mono"
                                            maxLength={10}
                                            autoFocus
                                        />
                                        {form.errors.code && (
                                            <p className="text-sm text-red-600">{form.errors.code}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            Normalmente se usan 3 letras (ISO 4217).
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <Label htmlFor="name" className="text-lg font-medium">Nombre de la moneda</Label>
                                        <Input
                                            id="name"
                                            placeholder="Dólar estadounidense, Euro, Peso colombiano..."
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            className="h-12 text-base"
                                        />
                                        {form.errors.name && (
                                            <p className="text-sm text-red-600">{form.errors.name}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            El nombre completo de la moneda.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <Label htmlFor="symbol" className="text-lg font-medium">Símbolo</Label>
                                        <Input
                                            id="symbol"
                                            placeholder="$, €, ₪, ¥..."
                                            value={form.data.symbol}
                                            onChange={(e) => form.setData('symbol', e.target.value)}
                                            className="h-12 text-base"
                                            maxLength={10}
                                        />
                                        {form.errors.symbol && (
                                            <p className="text-sm text-red-600">{form.errors.symbol}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            El símbolo que se mostrará junto a los montos.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'formatting' && (
                            <motion.div
                                key="formatting"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <Label htmlFor="decimal_places" className="text-lg font-medium">Decimales</Label>
                                        <Input
                                            id="decimal_places"
                                            type="number"
                                            min="0"
                                            max="8"
                                            value={form.data.decimal_places}
                                            onChange={(e) => form.setData('decimal_places', parseInt(e.target.value) || 0)}
                                            className="h-12 text-base"
                                        />
                                        {form.errors.decimal_places && (
                                            <p className="text-sm text-red-600">{form.errors.decimal_places}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            Número de decimales a mostrar (0-8).
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                        <div className="space-y-4">
                                            <Label className="text-lg font-medium">Separador decimal</Label>
                                            <Select 
                                                value={form.data.decimal_separator} 
                                                onValueChange={(value) => form.setData('decimal_separator', value)}
                                            >
                                                <SelectTrigger className="h-12">
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

                                    <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                        <div className="space-y-4">
                                            <Label className="text-lg font-medium">Separador de miles</Label>
                                            <Select 
                                                value={form.data.thousands_separator} 
                                                onValueChange={(value) => form.setData('thousands_separator', value)}
                                            >
                                                <SelectTrigger className="h-12">
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

                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <Label className="text-lg font-medium">Posición del símbolo</Label>
                                        <Select 
                                            value={form.data.symbol_position} 
                                            onValueChange={(value) => form.setData('symbol_position', value as 'before' | 'after')}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SYMBOL_POSITIONS.map((position) => (
                                                    <SelectItem key={position.value} value={position.value}>
                                                        <div>
                                                            <div className="font-medium">{position.label}</div>
                                                            <div className="text-sm text-gray-500">{position.description}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                                    <div className="text-center">
                                        <Label className="text-lg font-medium text-blue-900">Vista previa</Label>
                                        <div className="mt-2 text-2xl font-bold text-blue-800">
                                            {formatPreview(1234.56)}
                                        </div>
                                        <p className="mt-1 text-sm text-blue-600">
                                            Así se verán los montos con tu configuración
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'conversion' && (
                            <motion.div
                                key="conversion"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <Label htmlFor="conversion_rate" className="text-lg font-medium">Tasa de conversión</Label>
                                        <Input
                                            id="conversion_rate"
                                            type="number"
                                            step="0.000001"
                                            min="0.000001"
                                            placeholder="1.0"
                                            value={form.data.conversion_rate}
                                            onChange={(e) => form.setData('conversion_rate', parseFloat(e.target.value) || 1)}
                                            className="h-12 text-base"
                                        />
                                        {form.errors.conversion_rate && (
                                            <p className="text-sm text-red-600">{form.errors.conversion_rate}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            Tasa de conversión respecto a tu moneda base. Si esta es tu moneda base, usa 1.0.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
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
                                            <Label htmlFor="is_base" className="text-lg font-medium cursor-pointer">
                                                Establecer como moneda base
                                            </Label>
                                            <p className="text-sm text-gray-500">
                                                La moneda base se usa como referencia para las conversiones. Solo puedes tener una moneda base.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                                    <h3 className="text-lg font-medium text-green-900 mb-4">Resumen</h3>
                                    <div className="space-y-2 text-green-800">
                                        <div className="flex justify-between">
                                            <span>Código:</span>
                                            <span className="font-medium">{form.data.code}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Nombre:</span>
                                            <span className="font-medium">{form.data.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Símbolo:</span>
                                            <span className="font-medium">{form.data.symbol}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Formato:</span>
                                            <span className="font-medium">{formatPreview(1234.56)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tasa:</span>
                                            <span className="font-medium">{form.data.conversion_rate}</span>
                                        </div>
                                        {form.data.is_base && (
                                            <div className="mt-2 px-2 py-1 bg-green-200 rounded text-center text-sm font-medium">
                                                Moneda Base
                                            </div>
                                        )}
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
                    {step !== 'basic' && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex-1"
                            disabled={form.processing}
                        >
                            Atrás
                        </Button>
                    )}
                    <Button
                        onClick={step === 'conversion' ? handleSubmit : handleContinue}
                        disabled={!canContinue() || form.processing}
                        className="flex-1 gap-2"
                    >
                        {form.processing ? (
                            'Creando...'
                        ) : step === 'conversion' ? (
                            <>
                                <PlusIcon className="h-4 w-4" />
                                Crear moneda
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