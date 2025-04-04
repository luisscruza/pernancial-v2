import * as React from 'react';
import { type Account, type CreateAccountData, type BaseCurrency } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CurrencyInput } from '@/components/ui/currency-input';

const ACCOUNT_TYPES: Array<{ type: Account['type']; label: string; emoji: string; description: string }> = [
    { type: 'savings', label: 'Ahorro', emoji: '💰', description: 'Para ahorros y metas financieras' },
    { type: 'cash', label: 'Efectivo', emoji: '💵', description: 'Para gastos diarios y efectivo' },
    { type: 'investment', label: 'Inversión', emoji: '📈', description: 'Para inversiones y portafolios' },
    { type: 'credit_card', label: 'Tarjeta de crédito', emoji: '💳', description: 'Para tarjetas de crédito' },
];

interface AccountFormProps {
    currencies: BaseCurrency[];
    step: 'type' | 'balance' | 'name';
    formData: Partial<CreateAccountData>;
    onChange: (data: Partial<CreateAccountData>) => void;
}

export function AccountForm({ currencies, step, formData, onChange }: AccountFormProps) {
    const selectedCurrency = React.useMemo(() =>
        currencies.find(c => c.value === formData.currency_id?.toString()),
        [currencies, formData.currency_id]
    );

    // Add refs for the input elements
    const currencySelectRef = React.useRef<HTMLDivElement>(null);
    const balanceInputRef = React.useRef<HTMLDivElement>(null);

    // Function to scroll to an element with smooth animation
    const scrollToElement = (ref: React.RefObject<HTMLElement>) => {
        if (ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    const handleTypeChange = (value: string) => {
        onChange({ type: value as Account['type'] });
    };

    const handleDataChange = (key: keyof CreateAccountData, value: string | number) => {
        // For balance, convert empty string to 0
        if (key === 'balance' && (value === '' || value === null)) {
            value = 0;
        }

        onChange({ [key]: value });
    };

    return (
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
                            value={formData.type}
                            onValueChange={handleTypeChange}
                            className="grid grid-cols-1 gap-4"
                        >
                            {ACCOUNT_TYPES.map(({ type: accountType, label, emoji, description }) => (
                                <motion.div
                                    key={accountType}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="relative">
                                        <RadioGroupItem
                                            value={accountType}
                                            id={accountType}
                                            className="peer absolute right-8 top-1/2 -translate-y-1/2"
                                        />
                                        <Label
                                            htmlFor={accountType}
                                            className="flex cursor-pointer items-center gap-4 rounded-[1rem] border border-gray-200 p-4 
                                                hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                        >
                                            <div className="text-4xl">{emoji}</div>
                                            <div>
                                                <div className="font-medium">{label}</div>
                                                <div className="text-sm text-gray-500">{description}</div>
                                            </div>
                                        </Label>
                                    </div>
                                </motion.div>
                            ))}
                        </RadioGroup>
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
                        <div className="space-y-6">
                            <motion.div
                                ref={currencySelectRef}
                                className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50"
                                whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                                transition={{ duration: 0.2 }}
                            >
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
                                        value={formData.currency_id?.toString() || ""}
                                        onValueChange={(value) => {
                                            handleDataChange('currency_id', value);
                                            setTimeout(() => scrollToElement(balanceInputRef), 100);
                                        }}
                                    >
                                        <SelectTrigger
                                            id="currency"
                                            className="h-12 text-base"
                                            onClick={() => scrollToElement(currencySelectRef)}
                                        >
                                            <SelectValue placeholder="Selecciona una moneda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="max-h-[300px] overflow-y-auto p-1">
                                                {currencies.map((currency) => (
                                                    <SelectItem
                                                        key={currency.value}
                                                        value={currency.value}
                                                        className="cursor-pointer hover:bg-primary/5 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{currency.label}</span>
                                                            <span className="text-gray-500">{currency.symbol}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </div>
                                        </SelectContent>
                                    </Select>

                                    <motion.p
                                        className="text-sm text-gray-500"
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Esta será la moneda por defecto para esta cuenta. Puedes cambiarla en cualquier momento.
                                    </motion.p>
                                </div>
                            </motion.div>

                            <motion.div
                                ref={balanceInputRef}
                                className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50"
                                whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                                transition={{ duration: 0.2 }}
                            >
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
                                                currency={selectedCurrency}
                                                value={formData.balance ?? 0}
                                                onChange={(value) => handleDataChange('balance', value)}
                                                className="pl-10 h-14 text-xl font-medium"
                                                allowNegative={true}
                                                onFocus={() => scrollToElement(balanceInputRef)}
                                            />
                                        </div>
                                    ) : (
                                        <Input
                                            id="balance"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.balance?.toString() ?? '0'}
                                            onChange={(e) => handleDataChange('balance', e.target.value ? parseFloat(e.target.value) : 0)}
                                            className="h-14 text-xl font-medium"
                                            onFocus={() => scrollToElement(balanceInputRef)}
                                        />
                                    )}

                                    <motion.div
                                        className="flex items-center justify-between mt-2"
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <span className="text-xs text-gray-500">Cantidad con la que iniciarás tu cuenta</span>

                                        {formData.balance !== undefined && (
                                            <motion.button
                                                type="button"
                                                onClick={() => {
                                                    const currentBalance = formData.balance || 0;
                                                    const newBalance = currentBalance >= 0
                                                        ? -Math.abs(currentBalance) // If positive, make negative
                                                        : Math.abs(currentBalance); // If negative, make positive
                                                    handleDataChange('balance', newBalance);
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors ${(formData.balance || 0) >= 0
                                                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                                                    : "bg-red-50 text-red-600 hover:bg-red-100"
                                                    }`}
                                            >
                                                {(formData.balance || 0) >= 0 ? "Saldo positivo" : "Saldo negativo"}
                                            </motion.button>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="flex justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="text-center max-w-sm">
                                    <p className="text-sm text-gray-500">
                                        Puedes modificar estos valores en cualquier momento desde la configuración de tu cuenta.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {step === 'name' && (
                    <motion.div
                        key="name"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-6">
                            <motion.div
                                className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50"
                                whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="name" className="text-lg font-medium">Nombre de la cuenta</Label>
                                        {formData.name && (
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full"
                                            >
                                                {formData.type}
                                            </motion.div>
                                        )}
                                    </div>

                                    <Input
                                        id="name"
                                        placeholder="Ej: Mi cuenta de ahorros"
                                        value={formData.name ?? ''}
                                        onChange={(e) => handleDataChange('name', e.target.value)}
                                        className="h-12 text-base"
                                        autoFocus
                                    />

                                    <motion.p
                                        className="text-sm text-gray-500"
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Este nombre te ayudará a identificar tu cuenta fácilmente.
                                    </motion.p>
                                </div>
                            </motion.div>

                            <motion.div
                                className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50"
                                whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="space-y-4">
                                    <Label htmlFor="description" className="text-lg font-medium">Descripción (opcional)</Label>

                                    <Textarea
                                        id="description"
                                        placeholder="Añade una descripción para tu cuenta"
                                        value={formData.description ?? ''}
                                        onChange={(e) => handleDataChange('description', e.target.value)}
                                        className="min-h-[100px] text-base resize-none"
                                    />

                                    <motion.div
                                        className="flex items-center justify-between mt-2"
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <span className="text-sm text-gray-500">Puedes añadir detalles adicionales sobre el propósito de esta cuenta</span>

                                        {formData.description && (
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                                            >
                                                {formData.description.length} caracteres
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="flex justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="text-center max-w-sm">
                                    <p className="text-sm text-gray-500">
                                        Puedes modificar estos datos en cualquier momento desde la configuración de tu cuenta.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 