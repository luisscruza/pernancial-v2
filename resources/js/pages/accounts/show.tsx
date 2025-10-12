import { PaginatedProps, SharedData } from '@/types';
import { Account, Transaction } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil, Trash2, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency} from '@/utils/currency';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import TransactionModal from '@/components/transaction-modal';

interface Category {
    id: number;
    name: string;
    emoji: string;
    type: string;
}

interface OtherAccount {
    id: number;
    name: string;
    emoji: string;
    currency: {
        symbol: string;
        name: string;
    };
}

interface TransactionType {
    value: string;
    label: string;
}

interface Props extends SharedData {
    account: Account;
    transactions: PaginatedProps<Transaction>;
    incomeCategories: Category[];
    expenseCategories: Category[];
    otherAccounts: OtherAccount[];
    transactionTypes: TransactionType[];
}

export default function Show({
    account,
    transactions,
    incomeCategories,
    expenseCategories,
    otherAccounts,
    transactionTypes
}: Props) {

    const [tab, setTab] = useState('balance');
    const [hasReachedEnd, setHasReachedEnd] = useState<boolean | undefined>();
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

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

    const handleLoadMore = () => {
        if (transactions.next_page_url && !isLoadingMore) {
            setIsLoadingMore(true);
            router.visit(transactions.next_page_url, {
                only: ['transactions'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoadingMore(false),
            });
        }
    };


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
                        <Button
                            onClick={() => setIsTransactionModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva transacción
                        </Button>
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
                                                                    { transaction.category ? (
                                                                        <span className="text-lg">{transaction.category.emoji}</span>
                                                                    ) : (
                                                                        transaction.type === 'transfer_in' ? <span className="text-lg">⬅️</span> :
                                                                        transaction.type === 'transfer_out' ? <span className="text-lg">➡️</span> :
                                                                        <span className="text-lg">❓</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    {transaction.category && (
                                                                        <h3 className="font-medium">{transaction.category.name}</h3>
                                                                    )}

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
                                                            <p className={`${typeColorMap[transaction.type]} text-md font-medium flex flex-col items-end`}>
                                                                {getSymbol(transaction.type)}
                                                                   {formatCurrency(transaction.amount, account.currency!)}
                                                                <span className="text-xs text-gray-500">{formatCurrency(transaction.running_balance, account.currency!)}</span>
                                                            </p>

                                                        </motion.div>
                                                    ))}

                                                    {transactions.next_page_url && (
                                                        <div className="flex justify-center pt-6">
                                                            <Button
                                                                onClick={handleLoadMore}
                                                                disabled={isLoadingMore}
                                                                variant="outline"
                                                                className="min-w-32"
                                                            >
                                                                {isLoadingMore ? 'Cargando...' : 'Cargar más'}
                                                            </Button>
                                                        </div>
                                                    )}

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

                {/* Transaction Modal */}
                <TransactionModal
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    account={account}
                    incomeCategories={incomeCategories}
                    expenseCategories={expenseCategories}
                    otherAccounts={otherAccounts}
                    transactionTypes={transactionTypes}
                />
            </div>
        </AppLayout>
    );
}
