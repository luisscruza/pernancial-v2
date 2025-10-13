import AppLayout from '@/layouts/app-layout';
import { Currency } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PlusIcon, CoinsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurrencyItemProps {
    currency: Currency & {
        rates?: Array<{ rate: number; effective_date: string }>;
        conversion_rate: number;
        is_base: boolean;
    };
}

function CurrencyItem({ currency }: CurrencyItemProps) {
    const formatRate = (rate: number) => {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(rate);
    };

    return (
        <Link href={route('currencies.show', currency.id)}>
            <motion.div
                layout
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center gap-4">
                    <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 text-xl font-bold text-blue-600"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15
                        }}
                    >
                        {currency.symbol}
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{currency.code}</h3>
                            {currency.is_base && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    Base
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">{currency.name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-medium text-gray-900">
                        {formatRate(currency.conversion_rate)}
                    </p>
                    <p className="text-xs text-gray-500">Tasa actual</p>
                </div>
            </motion.div>
        </Link>
    );
}

export default function CurrenciesPage({ 
    currencies 
}: { 
    currencies: Array<Currency & {
        rates?: Array<{ rate: number; effective_date: string }>;
        conversion_rate: number;
        is_base: boolean;
    }> 
}) {
    const baseCurrency = currencies.find(currency => currency.is_base);
    const otherCurrencies = currencies.filter(currency => !currency.is_base);

    return (
        <AppLayout title="Monedas">
            <Head title="Monedas" />
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
                        <CoinsIcon className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Monedas
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
                            <Link href={route('currencies.create')} className="gap-2">
                                <PlusIcon className="h-4 w-4" />
                                Nueva moneda
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>

                <motion.div
                    layout
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Base Currency */}
                    {baseCurrency && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <motion.h2
                                className="mb-4 text-xl font-semibold text-gray-800"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Moneda base
                            </motion.h2>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.3 }}
                            >
                                <CurrencyItem currency={baseCurrency} />
                            </motion.div>
                        </motion.section>
                    )}

                    {/* Other Currencies */}
                    {otherCurrencies.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: baseCurrency ? 0.4 : 0.2 }}
                        >
                            <motion.h2
                                className="mb-4 text-xl font-semibold text-gray-800"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: baseCurrency ? 0.5 : 0.3 }}
                            >
                                Otras monedas
                            </motion.h2>
                            <div className="grid gap-4">
                                <AnimatePresence mode="popLayout">
                                    {otherCurrencies.map((currency, index) => (
                                        <motion.div
                                            key={currency.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{
                                                delay: index * 0.1 + (baseCurrency ? 0.6 : 0.4),
                                                duration: 0.3
                                            }}
                                        >
                                            <CurrencyItem currency={currency} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.section>
                    )}

                    {/* Empty State */}
                    {currencies.length === 0 && (
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-xl border border-dashed border-gray-200 p-8 text-center"
                        >
                            <motion.div
                                className="text-4xl"
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.2,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15
                                }}
                            >
                                💰
                            </motion.div>
                            <motion.h3
                                className="mt-4 text-lg font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                No tienes monedas configuradas
                            </motion.h3>
                            <motion.p
                                className="mt-2 text-sm text-gray-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Crea tu primera moneda para gestionar diferentes divisas en tus transacciones.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Button
                                    variant="default"
                                    asChild
                                    className="mt-6 rounded-full bg-blue-500 hover:bg-blue-600"
                                >
                                    <Link href={route('currencies.create')} className="gap-2">
                                        <PlusIcon className="h-4 w-4" />
                                        Crear moneda
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}