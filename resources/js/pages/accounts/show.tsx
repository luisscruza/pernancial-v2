import TransactionModal from '@/components/transaction-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Account, Currency, PaginatedProps, SharedData, Transaction } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronLeft, Edit2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
    id: number;
    name: string;
    emoji: string;
    type: string;
}

interface Contact {
    id: number;
    name: string;
    email?: string;
    phone?: string;
}

interface OtherAccount {
    id: number;
    name: string;
    emoji: string;
    currency: {
        symbol: string;
        name: string;
        rate: number;
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
    contacts: Contact[];
    transactionTypes: TransactionType[];
    filters: {
        date_from: string;
        date_to: string;
    };
}

export default function Show({ account, transactions, incomeCategories, expenseCategories, otherAccounts, contacts, transactionTypes }: Props) {
    const [tab, setTab] = useState('balance');
    const [hasReachedEnd, setHasReachedEnd] = useState<boolean | undefined>();
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const page = usePage<SharedData>();
    const { base_currency } = page.props;

    const typeColorMap: Record<string, string> = {
        expense: 'text-red-500',
        income: 'text-green-500',
        initial: 'text-gray-500',
        transfer_in: 'text-green-500',
        transfer_out: 'text-red-500',
        adjustment_negative: 'text-red-500',
        adjustment_positive: 'text-green-500',
    };

    const getSymbol = (type: string) => {
        switch (type) {
            case 'expense':
                return '-';
            case 'income':
                return '+';
            case 'initial':
                return '';
            case 'transfer_in':
                return '+';
            case 'transfer_out':
                return '-';
            case 'adjustment_negative':
                return '-';
            case 'adjustment_positive':
                return '+';
            default:
                return '';
        }
    };

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

    // Group transactions by month
    const groupedTransactions = transactions.data.reduce(
        (groups, transaction) => {
            const date = new Date(transaction.transaction_date);
            const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });

            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push(transaction);
            return groups;
        },
        {} as Record<string, Transaction[]>,
    );

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsTransactionModalOpen(false);
        setEditingTransaction(null);
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

            <div className="ml-8 w-full max-w-7xl space-y-6 p-4">
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
                        <Button onClick={() => setIsTransactionModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva transacción
                        </Button>
                        <Link href={route('accounts.edit', account.uuid)}>
                            <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                    <Card>
                        <CardHeader className="flex-row items-start justify-between space-y-0">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-lg">
                                    <span className="text-2xl">{account.emoji}</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{account.name}</h2>
                                    <p className="text-muted-foreground">{account.type_label || account.type}</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Tabs value={tab} onValueChange={setTab} className="w-full">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="balance">Balance</TabsTrigger>
                                    <TabsTrigger value="records">Transacciones</TabsTrigger>
                                </TabsList>
                                <TabsContent value="balance" className="space-y-4">
                                    <div className="mt-6">
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-sm">TODAY</p>
                                            <p className="text-3xl font-semibold">{formatCurrency(account.balance, account.currency!)}</p>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="records">
                                    {transactions.data.length === 0 ? (
                                        <motion.div
                                            className="rounded-xl border border-dashed border-gray-200 p-8 text-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="mb-4 text-4xl">💸</div>
                                            <h3 className="mb-2 text-lg font-medium">Sin transacciones</h3>
                                            <p className="text-sm text-gray-500">No hay transacciones para esta cuenta aún.</p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            {Object.entries(groupedTransactions).map(([month, monthTransactions], monthIndex) => (
                                                <div key={month} className="space-y-2">
                                                    <motion.div
                                                        className="bg-background sticky top-0 pt-4 pb-2"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: monthIndex * 0.05 }}
                                                    >
                                                        <h3 className="text-muted-foreground text-sm font-semibold tracking-wide capitalize">
                                                            {month}
                                                        </h3>
                                                    </motion.div>

                                                    {monthTransactions.map((transaction) => (
                                                        <motion.div
                                                            key={transaction.id}
                                                            layout
                                                            className="group -mx-2 flex cursor-pointer items-center justify-between rounded-lg border-b px-2 py-4 transition-colors last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            onClick={() => handleEditTransaction(transaction)}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                                                    {transaction.splits && transaction.splits.length > 0 ? (
                                                                        <span className="text-lg">🧩</span>
                                                                    ) : transaction.category ? (
                                                                        <span className="text-lg">{transaction.category.emoji}</span>
                                                                    ) : transaction.type === 'transfer_in' ? (
                                                                        <span className="text-lg">⬅️</span>
                                                                    ) : transaction.type === 'transfer_out' ? (
                                                                        <span className="text-lg">➡️</span>
                                                                    ) : (
                                                                        <span className="text-lg">❓</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    {transaction.splits && transaction.splits.length > 0 ? (
                                                                        <h3 className="font-medium">
                                                                            Dividida en {transaction.splits.length} categorías
                                                                        </h3>
                                                                    ) : transaction.personal_amount !== null &&
                                                                      transaction.personal_amount !== undefined ? (
                                                                        <h3 className="font-medium">Gasto compartido</h3>
                                                                    ) : transaction.category ? (
                                                                        <h3 className="font-medium">{transaction.category.name}</h3>
                                                                    ) : null}

                                                                    {transaction.description && (
                                                                        <p className="text-muted-foreground text-sm">{transaction.description}</p>
                                                                    )}

                                                                    {transaction.splits && transaction.splits.length > 0 && (
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {transaction.splits.map((split) => (
                                                                                <span
                                                                                    key={`${transaction.id}-${split.id}`}
                                                                                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                                                                >
                                                                                    <span>{split.category?.emoji || '🧾'}</span>
                                                                                    <span>{split.category?.name || 'Sin categoría'}</span>
                                                                                    <span className="text-gray-400">
                                                                                        {formatCurrency(split.amount, account.currency!)}
                                                                                    </span>
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {transaction.ai_assisted && (
                                                                        <Badge variant="secondary" className="mt-1">
                                                                            Asistida por IA
                                                                        </Badge>
                                                                    )}

                                                                    {transaction.personal_amount !== null &&
                                                                        transaction.personal_amount !== undefined && (
                                                                            <Badge variant="secondary" className="mt-1">
                                                                                Tu parte:{' '}
                                                                                {formatCurrency(transaction.personal_amount, account.currency!)}
                                                                            </Badge>
                                                                        )}

                                                                    {transaction.type.startsWith('transfer') && (
                                                                        <p className="text-muted-foreground text-sm">
                                                                            <span className="font-medium">Transferencia </span>
                                                                            {transaction.type === 'transfer_in'
                                                                                ? `Desde: ${transaction.from_account?.name} (${transaction.from_account?.currency.symbol})`
                                                                                : `A: ${transaction.destination_account?.name} (${transaction.destination_account?.currency.symbol})`}
                                                                        </p>
                                                                    )}

                                                                    <p className="text-muted-foreground text-sm">
                                                                        {new Date(transaction.transaction_date).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <p
                                                                    className={`${typeColorMap[transaction.type]} text-md flex flex-col items-end font-medium`}
                                                                >
                                                                    <span>
                                                                        {getSymbol(transaction.type)}
                                                                        {formatCurrency(transaction.amount, account.currency!)}
                                                                        {!account.currency.is_base && (
                                                                            <span className="text-xs text-gray-500">
                                                                                (
                                                                                {formatCurrency(
                                                                                    transaction.converted_amount!,
                                                                                    base_currency as Currency,
                                                                                )}
                                                                                )
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatCurrency(transaction.running_balance, account.currency!)}
                                                                    </span>
                                                                </p>
                                                                <Edit2 className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ))}

                                            {transactions.next_page_url && (
                                                <div className="flex justify-center pt-6">
                                                    <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="outline" className="min-w-32">
                                                        {isLoadingMore ? 'Cargando...' : 'Cargar más'}
                                                    </Button>
                                                </div>
                                            )}

                                            {hasReachedEnd && (
                                                <p className="text-muted-foreground text-center text-sm">No hay más registros que mostrar.</p>
                                            )}
                                        </>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Transaction Modal */}
                <TransactionModal
                    isOpen={isTransactionModalOpen}
                    onClose={handleCloseModal}
                    account={account}
                    incomeCategories={incomeCategories}
                    expenseCategories={expenseCategories}
                    otherAccounts={otherAccounts}
                    contacts={contacts}
                    transactionTypes={transactionTypes}
                    transaction={editingTransaction}
                />
            </div>
        </AppLayout>
    );
}
