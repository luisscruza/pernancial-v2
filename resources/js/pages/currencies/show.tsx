import AppLayout from '@/layouts/app-layout';
import { Currency } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil, CoinsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface CurrencyRate {
    id: number;
    rate: number;
    effective_date: string;
    created_at: string;
}

interface Props {
    currency: Currency & {
        rates: CurrencyRate[];
        conversion_rate: number;
        is_base: boolean;
    };
}

export default function CurrencyShow({ currency }: Props) {
    const [tab, setTab] = useState('overview');

    const formatRate = (rate: number) => {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(rate);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatAmount = (amount: number) => {
        const formatted = amount.toFixed(currency.decimal_places)
            .replace('.', currency.decimal_separator);
        
        const parts = formatted.split(currency.decimal_separator);
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousands_separator);
        
        const finalAmount = parts.join(currency.decimal_separator);
        
        return currency.symbol_position === 'before' 
            ? `${currency.symbol}${finalAmount}`
            : `${finalAmount}${currency.symbol}`;
    };

    return (
        <AppLayout title={currency.name}>
            <Head title={currency.name} />

            <div className="mx-auto w-full max-w-4xl p-4 space-y-6">
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        <Link href={route('currencies.index')}>
                            <Button variant="ghost" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <CoinsIcon className="h-6 w-6 text-blue-600" />
                            <h1 className="text-2xl font-semibold text-gray-600">Moneda</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('currencies.edit', currency.id)}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="flex-row items-start justify-between space-y-0">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                                    <span className="text-2xl font-bold text-blue-600">{currency.symbol}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-semibold">{currency.code}</h2>
                                        {currency.is_base && (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                Base
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground">{currency.name}</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Tabs value={tab} onValueChange={setTab} className="w-full">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                                    <TabsTrigger value="rates">Historial de tasas</TabsTrigger>
                                    <TabsTrigger value="formatting">Formato</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="overview" className="space-y-4">
                                    <div className="mt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">Tasa actual</p>
                                                <p className="text-2xl font-semibold">
                                                    {formatRate(currency.conversion_rate)}
                                                </p>
                                            </div>
                                            
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">Registros de tasa</p>
                                                <p className="text-2xl font-semibold">
                                                    {currency.rates.length}
                                                </p>
                                            </div>

                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">Tipo</p>
                                                <p className="text-lg font-medium">
                                                    {currency.is_base ? 'Moneda Base' : 'Moneda Secundaria'}
                                                </p>
                                            </div>

                                            {currency.rates.length > 0 && (
                                                <div className="rounded-lg border p-4">
                                                    <p className="text-sm text-muted-foreground">Última actualización</p>
                                                    <p className="text-lg font-medium">
                                                        {formatDate(currency.rates[0].effective_date)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="rates">
                                    {currency.rates.length === 0 ? (
                                        <motion.div
                                            className="rounded-xl border border-dashed border-gray-200 p-8 text-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="text-4xl mb-4">📈</div>
                                            <h3 className="text-lg font-medium mb-2">Sin historial de tasas</h3>
                                            <p className="text-sm text-gray-500">
                                                No hay registros de cambios de tasa para esta moneda.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-4">
                                            {currency.rates.map((rate, index) => (
                                                <motion.div
                                                    key={rate.id}
                                                    layout
                                                    className="flex items-center justify-between border-b py-4 last:border-0"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                                            <span className="text-sm font-bold text-blue-600">
                                                                {currency.symbol}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">
                                                                {formatDate(rate.effective_date)}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                Vigente desde esta fecha
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-semibold">
                                                            {formatRate(rate.rate)}
                                                        </p>
                                                        {index === 0 && (
                                                            <span className="text-xs text-green-600 font-medium">
                                                                Actual
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="formatting" className="space-y-4">
                                    <div className="mt-6">
                                        <div className="space-y-6">
                                            <div className="rounded-lg border p-4">
                                                <h3 className="text-lg font-medium mb-4">Configuración de formato</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Decimales</p>
                                                        <p className="font-medium">{currency.decimal_places}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Separador decimal</p>
                                                        <p className="font-medium font-mono">"{currency.decimal_separator}"</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Separador de miles</p>
                                                        <p className="font-medium font-mono">"{currency.thousands_separator}"</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Posición del símbolo</p>
                                                        <p className="font-medium capitalize">
                                                            {currency.symbol_position === 'before' ? 'Antes' : 'Después'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                                                <h3 className="text-lg font-medium text-blue-900 mb-4">Ejemplos de formato</h3>
                                                <div className="space-y-2 text-blue-800">
                                                    <div className="flex justify-between">
                                                        <span>Cantidad pequeña:</span>
                                                        <span className="font-bold">{formatAmount(25.5)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Cantidad mediana:</span>
                                                        <span className="font-bold">{formatAmount(1234.56)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Cantidad grande:</span>
                                                        <span className="font-bold">{formatAmount(1234567.89)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AppLayout>
    );
}