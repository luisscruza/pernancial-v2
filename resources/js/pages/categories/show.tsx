import AppLayout from '@/layouts/app-layout';
import { PaginatedProps, SharedData } from '@/types';
import { Category, Transaction } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Props extends SharedData {
    category: Category;
    transactions: PaginatedProps<Transaction>;
}

export default function CategoryShow({
    category,
    transactions,
}: Props) {

    const [tab, setTab] = useState('overview');
    const [hasReachedEnd, setHasReachedEnd] = useState<boolean | undefined>();

    const typeColorMap: Record<string, string> = {
        expense: 'text-red-500',
        income: 'text-green-500',
        initial: 'text-gray-500',
        transfer_in: 'text-green-500',
        transfer_out: 'text-red-500',
    };

    const getSymbol = (type: string) => {
        switch (type) {
            case 'expense': return '-';
            case 'income': return '+';
            case 'initial': return '';
            case 'transfer_in': return '+';
            case 'transfer_out': return '-';
            default: return '';
        }
    }

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has('page')) {
            setTab('transactions');
        }
    }, []);

    useEffect(() => {
        if (transactions.next_page_url === null && transactions.data.length !== 0) {
            setHasReachedEnd(true);
        }
    }, [transactions.next_page_url, transactions.data.length]);

    return (
        <AppLayout title={category.name}>
            <Head title={category.name} />

            <div className="mx-auto w-full max-w-4xl p-4 space-y-6">
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        <Link href={route('categories')}>
                            <Button variant="ghost" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-semibold text-gray-600">Categoría</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('categories.edit', category.uuid)}>
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
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                                    <span className="text-2xl">{category.emoji}</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{category.name}</h2>
                                    <p className="text-muted-foreground capitalize">
                                        {category.type === 'expense' ? 'Gasto' : 'Ingreso'}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Tabs value={tab} onValueChange={setTab} className="w-full">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                                    <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="overview" className="space-y-4">
                                    <div className="mt-6">
                                        <div className="space-y-4">
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">Total de transacciones</p>
                                                <p className="text-2xl font-semibold">
                                                    {transactions.total}
                                                </p>
                                            </div>
                                            
                                            {transactions.data.length > 0 && (
                                                <div className="rounded-lg border p-4">
                                                    <p className="text-sm text-muted-foreground">Última transacción</p>
                                                    <p className="text-lg font-medium">
                                                        {new Date(transactions.data[0].transaction_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="transactions">
                                    {transactions.data.length === 0 ? (
                                        <motion.div
                                            className="rounded-xl border border-dashed border-gray-200 p-8 text-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="text-4xl mb-4">💸</div>
                                            <h3 className="text-lg font-medium mb-2">Sin transacciones</h3>
                                            <p className="text-sm text-gray-500">
                                                No hay transacciones para esta categoría aún.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            {transactions.data.map((transaction) => (
                                                <motion.div
                                                    key={transaction.id}
                                                    layout
                                                    className="flex items-center justify-between border-b py-4 last:border-0"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                            <span className="text-lg">{transaction.account.emoji}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">{transaction.account.name}</h3>
                                                            
                                                            {transaction.description && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {transaction.description}
                                                                </p>
                                                            )}

                                                            {transaction.type.startsWith('transfer') && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    <span className="font-medium">Transferencia </span>
                                                                    {transaction.type === 'transfer_in'
                                                                        ? `Desde: ${transaction.from_account?.name} (${transaction.from_account?.currency.symbol})`
                                                                        : `A: ${transaction.destination_account?.name} (${transaction.destination_account?.currency.symbol})`}
                                                                </p>
                                                            )}

                                                            <p className="text-sm text-muted-foreground">
                                                                {new Date(transaction.transaction_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <p className={`${typeColorMap[transaction.type]} text-md font-medium`}>
                                                            {getSymbol(transaction.type)}
                                                            {formatCurrency(transaction.amount, transaction.account.currency)}
                                                        </p>
                                                        <span className="text-xs text-gray-500">
                                                            {formatCurrency(transaction.running_balance, transaction.account.currency)}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {transactions.next_page_url && (
                                                <div className="flex justify-center pt-6">
                                                    <Button
                                                        onClick={() => {
                                                            window.location.href = transactions.next_page_url!;
                                                        }}
                                                        variant="outline"
                                                        className="min-w-32"
                                                    >
                                                        Cargar más
                                                    </Button>
                                                </div>
                                            )}

                                            {hasReachedEnd && (
                                                <p className="text-center text-sm text-muted-foreground pt-4">
                                                    No hay más registros que mostrar.
                                                </p>
                                            )}
                                        </>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AppLayout>
    );
}