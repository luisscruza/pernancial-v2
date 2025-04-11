import { PaginatedProps, SharedData } from '@/types';
import { Account, Transaction } from '@/types';
import { Head, Link, WhenVisible } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency} from '@/utils/currency';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Props extends SharedData {
    account: Account;
    transactions: PaginatedProps<Transaction>
}

export default function Show({ account, transactions }: Props) {

    const [tab, setTab] = useState('balance');
    const [hasReachedEnd, setHasReachedEnd] = useState<boolean | undefined>();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has('page')) {
            setTab('records');
        }
    }, []);

    useEffect(() => {
        if (transactions.next_page_url === null && transactions.data.length !== 0) {
            setHasReachedEnd(true);
        }
    }, [transactions.next_page_url, transactions.data.length]);

    return (
        <AppLayout title={account.name}>
            <Head title={account.name} />

            <div className="mx-auto w-full max-w-4xl p-4 space-y-6">
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        <Link href={route('accounts')}>
                            <Button variant="ghost" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-semibold text-gray-600">Detalle</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
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
                                    <span className="text-2xl">{account.emoji}</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{account.name}</h2>
                                    <p className="text-muted-foreground">{account.type}</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Tabs value={tab} onValueChange={setTab} className="w-full">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="balance">Balance</TabsTrigger>
                                    <TabsTrigger  value="records">Transacciones</TabsTrigger>
                                </TabsList>
                                <TabsContent value="balance" className="space-y-4">
                                    <div className="mt-6">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">TODAY</p>
                                            <p className="text-3xl font-semibold">
                                                {formatCurrency(account.balance, account.currency!)}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="records">
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
                                                                    <span>{transaction.category?.emoji || '💰'}</span>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium">{transaction.description}</h3>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {new Date(transaction.transaction_date).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className={transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                                                                {formatCurrency(transaction.amount, account.currency!)}
                                                            </p>
                                                        </motion.div>
                                                    ))}
                                    <WhenVisible params={{
                                        only: ['transactions'],
                                        data: {
                                            page: transactions.current_page + 1,
                                        }
                                    }} always={transactions.next_page_url != null} fallback={<div className="text-md text-center">Cargando...</div>}>
                                       <></>
                                    </WhenVisible>
                                    {hasReachedEnd ? (
                                        <p className="text-center text-sm text-muted-foreground">
                                            No hay más registros que mostrar.
                                        </p>
                                    ) : null}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AppLayout>
    );
}
