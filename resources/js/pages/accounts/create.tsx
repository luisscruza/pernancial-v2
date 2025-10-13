import AppLayout from '@/layouts/app-layout';
import { type Currency } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PlusIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from '@/components/ui/currency-input';

interface AccountTypeOption {
    value: string;
    label: string;
    emoji: string;
    description: string;
}

interface Props {
    currencies: Currency[];
    accountTypes: AccountTypeOption[];
}

export default function CreateAccount({ currencies, accountTypes }: Props) {
    const [step, setStep] = useState<'type' | 'details' | 'balance'>('type');

    const form = useForm({
        name: '',
        description: '',
        balance: 0,
        currency_id: currencies.length > 0 ? currencies[0].id : 0,
        type: '',
    });

    // If no currencies available, show error state
    if (!currencies || currencies.length === 0) {
        return (
            <AppLayout title="Crear cuenta">
                <Head title="Crear cuenta" />
                <div className="mx-auto w-full max-w-2xl p-4">
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay monedas disponibles</h2>
                        <p className="text-gray-600 mb-6">
                            Necesitas tener al menos una moneda configurada antes de crear una cuenta.
                        </p>
                        <Button asChild>
                            <Link href="/accounts">Volver a cuentas</Link>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const selectedCurrency = currencies.find(c => c.id === form.data.currency_id);
    const selectedAccountType = accountTypes.find(t => t.value === form.data.type);

    const handleContinue = () => {
        if (step === 'type' && form.data.type) {
            setStep('details');
        } else if (step === 'details' && form.data.name) {
            setStep('balance');
        }
    };

    const handleBack = () => {
        if (step === 'balance') {
            setStep('details');
        } else if (step === 'details') {
            setStep('type');
        }
    };

    const canContinue = () => {
        if (step === 'type') return !!form.data.type;
        if (step === 'details') return !!form.data.name.trim();
        if (step === 'balance') return form.data.currency_id > 0 && form.data.balance !== undefined;
        return false;
    };

    const handleSubmit = () => {
        if (step === 'balance') {
            form.post(route('accounts.store'), {
                onSuccess: () => {
                    // Success will be handled by redirect
                }
            });
        }
    };

    return (
        <AppLayout title="Crear cuenta">
            <Head title="Crear cuenta" />
            <div className="mx-auto w-full max-w-2xl p-4">
                {/* Header */}
                <motion.div
                    className="mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear nueva cuenta</h1>
                        <p className="text-gray-600">
                            {step === 'type' && 'Selecciona el tipo de cuenta'}
                            {step === 'details' && 'Añade los detalles de tu cuenta'}
                            {step === 'balance' && 'Configura el saldo inicial'}
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
                        {['type', 'details', 'balance'].map((stepName, index) => (
                            <div key={stepName} className="flex items-center">
                                <div
                                    className={`h-2 w-8 rounded-full transition-colors ${
                                        step === stepName || ['type', 'details', 'balance'].indexOf(step) > index
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
                                    onValueChange={(value) => form.setData('type', value)}
                                    className="grid grid-cols-1 gap-4"
                                >
                                    {accountTypes.map((accountType) => (
                                        <motion.div
                                            key={accountType.value}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="relative">
                                                <RadioGroupItem
                                                    value={accountType.value}
                                                    id={accountType.value}
                                                    className="peer absolute right-4 top-1/2 -translate-y-1/2"
                                                />
                                                <Label
                                                    htmlFor={accountType.value}
                                                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 p-6 
                                                        hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                >
                                                    <div className="text-3xl">{accountType.emoji}</div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">{accountType.label}</div>
                                                        <div className="text-sm text-gray-500">{accountType.description}</div>
                                                    </div>
                                                </Label>
                                            </div>
                                        </motion.div>
                                    ))}
                                </RadioGroup>
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
                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="name" className="text-lg font-medium">Nombre de la cuenta</Label>
                                            {selectedAccountType && (
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1"
                                                >
                                                    <span>{selectedAccountType.emoji}</span>
                                                    <span>{selectedAccountType.label}</span>
                                                </motion.div>
                                            )}
                                        </div>

                                        <Input
                                            id="name"
                                            placeholder="Ej: Mi cuenta de ahorros"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            className="h-12 text-base"
                                            autoFocus
                                        />
                                        {form.errors.name && (
                                            <p className="text-sm text-red-600">{form.errors.name}</p>
                                        )}

                                        <motion.p
                                            className="text-sm text-gray-500"
                                            initial={{ y: 5, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            Este nombre te ayudará a identificar tu cuenta fácilmente.
                                        </motion.p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <Label htmlFor="description" className="text-lg font-medium">Descripción (opcional)</Label>

                                        <Textarea
                                            id="description"
                                            placeholder="Añade una descripción para tu cuenta"
                                            value={form.data.description}
                                            onChange={(e) => form.setData('description', e.target.value)}
                                            className="min-h-[100px] text-base resize-none"
                                        />
                                        {form.errors.description && (
                                            <p className="text-sm text-red-600">{form.errors.description}</p>
                                        )}

                                        <motion.div
                                            className="flex items-center justify-between mt-2"
                                            initial={{ y: 5, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <span className="text-sm text-gray-500">Puedes añadir detalles adicionales sobre el propósito de esta cuenta</span>

                                            {form.data.description && (
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                                                >
                                                    {form.data.description.length} caracteres
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'balance' && (
                            <motion.div
                                key="balance"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="currency" className="text-lg font-medium">Moneda</Label>
                                            {selectedCurrency && (
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full"
                                                >
                                                    {selectedCurrency.symbol}
                                                </motion.div>
                                            )}
                                        </div>

                                        <Select
                                            value={form.data.currency_id?.toString() || ''}
                                            onValueChange={(value) => form.setData('currency_id', parseInt(value))}
                                        >
                                            <SelectTrigger
                                                id="currency"
                                                className="h-12 text-base"
                                            >
                                                <SelectValue placeholder="Selecciona una moneda" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="max-h-[300px] overflow-y-auto p-1">
                                                    {currencies.filter(currency => currency?.id).map((currency) => (
                                                        <SelectItem
                                                            key={currency.id}
                                                            value={currency.id.toString()}
                                                            className="cursor-pointer hover:bg-primary/5 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{currency.name}</span>
                                                                <span className="text-gray-500">{currency.symbol}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.currency_id && (
                                            <p className="text-sm text-red-600">{form.errors.currency_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <Label htmlFor="balance" className="text-lg font-medium">Saldo inicial</Label>

                                        {selectedCurrency ? (
                                            <div className="relative">
                                                <motion.div
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium"
                                                    initial={{ x: -5, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    {selectedCurrency.symbol}
                                                </motion.div>
                                                <CurrencyInput
                                                    id="balance"
                                                    currency={{
                                                        symbol: selectedCurrency.symbol,
                                                        decimalSeparator: selectedCurrency.decimal_separator,
                                                        thousandsSeparator: selectedCurrency.thousands_separator,
                                                        decimalPlaces: selectedCurrency.decimal_places,
                                                    }}
                                                    value={form.data.balance}
                                                    onChange={(value) => form.setData('balance', value)}
                                                    className="pl-10 h-14 text-xl font-medium"
                                                    allowNegative={true}
                                                />
                                            </div>
                                        ) : (
                                            <Input
                                                id="balance"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={form.data.balance.toString()}
                                                onChange={(e) => form.setData('balance', e.target.value ? parseFloat(e.target.value) : 0)}
                                                className="h-14 text-xl font-medium"
                                            />
                                        )}
                                        {form.errors.balance && (
                                            <p className="text-sm text-red-600">{form.errors.balance}</p>
                                        )}

                                        <motion.div
                                            className="flex items-center justify-between mt-2"
                                            initial={{ y: 5, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <span className="text-xs text-gray-500">Cantidad con la que iniciarás tu cuenta</span>

                                            <motion.button
                                                type="button"
                                                onClick={() => {
                                                    const currentBalance = form.data.balance || 0;
                                                    const newBalance = currentBalance >= 0
                                                        ? -Math.abs(currentBalance)
                                                        : Math.abs(currentBalance);
                                                    form.setData('balance', newBalance);
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors ${
                                                    (form.data.balance || 0) >= 0
                                                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                                }`}
                                            >
                                                {(form.data.balance || 0) >= 0 ? "Saldo positivo" : "Saldo negativo"}
                                            </motion.button>
                                        </motion.div>
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
                        onClick={step === 'balance' ? handleSubmit : handleContinue}
                        disabled={!canContinue() || form.processing}
                        className="flex-1 gap-2"
                    >
                        {form.processing ? (
                            'Creando...'
                        ) : step === 'balance' ? (
                            <>
                                <PlusIcon className="h-4 w-4" />
                                Crear cuenta
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