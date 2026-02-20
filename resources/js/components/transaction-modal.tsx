import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Account, Transaction } from '@/types';
import type { FormDataConvertible } from '@inertiajs/core';
import { router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightLeft, Calendar, LayoutGrid, Minus, Plus, Trash2, Users, X } from 'lucide-react';
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

interface AccountOption {
    id: number;
    name: string;
    emoji: string;
    currency: {
        symbol: string;
        name: string;
        rate: number;
    };
}

type SplitRow = {
    category_id: string;
    amount: string;
} & Record<string, FormDataConvertible>;

type SharedRow = {
    contact_id: string;
    amount: string;
    paid_account_id: string;
} & Record<string, FormDataConvertible>;

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: Account;
    incomeCategories: Category[];
    expenseCategories: Category[];
    otherAccounts: OtherAccount[];
    contacts: Contact[];
    transactionTypes: TransactionType[];
    transaction?: Transaction | null;
}

export default function TransactionModal({
    isOpen,
    onClose,
    account,
    incomeCategories,
    expenseCategories,
    otherAccounts,
    contacts,
    transactionTypes = [],
    transaction = null,
}: TransactionModalProps) {
    const [selectedType, setSelectedType] = useState<string>('');
    const [categorySearch, setCategorySearch] = useState<string>('');
    const [splitCategorySearch, setSplitCategorySearch] = useState<string>('');
    const [destinationAccountSearch, setDestinationAccountSearch] = useState<string>('');
    const [paymentAccountSearch, setPaymentAccountSearch] = useState<string>('');
    const [contactSearch, setContactSearch] = useState<Record<number, string>>({});
    const [isSplitEnabled, setIsSplitEnabled] = useState(false);
    const [isSharedEnabled, setIsSharedEnabled] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm<{
        type: string;
        amount: string;
        personal_amount: string;
        received_amount: string;
        description: string;
        category_id: string;
        destination_account_id: string;
        transaction_date: string;
        splits: SplitRow[];
        is_shared: boolean;
        shared_receivables: SharedRow[];
    }>({
        type: '',
        amount: '',
        personal_amount: '',
        received_amount: '',
        description: '',
        category_id: '',
        destination_account_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        splits: [] as SplitRow[],
        is_shared: false,
        shared_receivables: [] as SharedRow[],
    });
    const splitErrors = errors as Record<string, string>;

    useEffect(() => {
        if (!isOpen) {
            // Reset when modal closes
            return;
        }

        if (transaction) {
            // Ensure date is in YYYY-MM-DD format for input field
            let formattedDate = transaction.transaction_date;

            // If date includes time (ISO string or datetime), extract just the date part
            if (formattedDate.includes('T')) {
                formattedDate = formattedDate.split('T')[0];
            }

            // Normalize transfer types: convert transfer_in/transfer_out to 'transfer'
            const normalizedType = transaction.type === 'transfer_in' || transaction.type === 'transfer_out' ? 'transfer' : transaction.type;

            const mappedSplits: SplitRow[] = (transaction.splits || []).map((split) => ({
                category_id: split.category?.id?.toString() || split.category_id?.toString() || '',
                amount: split.amount?.toString() || '',
            }));

            const mappedReceivables: SharedRow[] = (transaction.receivables || []).map((receivable) => ({
                contact_id: receivable.contact?.id?.toString() || receivable.contact_id?.toString() || '',
                amount: receivable.amount_total?.toString() || '',
                paid_account_id: '',
            }));

            setData({
                type: normalizedType,
                amount: transaction.amount.toString(),
                personal_amount: transaction.personal_amount?.toString() || '',
                received_amount: '',
                description: transaction.description || '',
                category_id: transaction.category?.id?.toString() || '',
                destination_account_id: transaction.destination_account?.id?.toString() || '',
                transaction_date: formattedDate,
                splits: mappedSplits,
                is_shared: mappedReceivables.length > 0 || transaction.personal_amount !== null,
                shared_receivables: mappedReceivables,
            });
            setSelectedType(normalizedType);
            setIsSplitEnabled(mappedSplits.length > 0);
            setIsSharedEnabled(mappedReceivables.length > 0 || transaction.personal_amount !== null);
            setSplitCategorySearch('');
        } else {
            // Reset form when opening modal for new transaction
            setData({
                type: '',
                amount: '',
                personal_amount: '',
                received_amount: '',
                description: '',
                category_id: '',
                destination_account_id: '',
                transaction_date: new Date().toISOString().split('T')[0],
                splits: [],
                is_shared: false,
                shared_receivables: [],
            });
            setSelectedType('');
            setCategorySearch('');
            setIsSplitEnabled(false);
            setIsSharedEnabled(false);
            setSplitCategorySearch('');
        }
    }, [isOpen, transaction, setData]);

    // automatically set received_amount when amount or destination_account_id changes for transfers
    useEffect(() => {
        if (selectedType === 'transfer' && data.destination_account_id && data.amount) {
            const transferRate = otherAccounts.find((acc) => acc.id.toString() === data.destination_account_id)?.currency.rate;
            if (transferRate !== undefined) {
                const calculatedAmount = parseFloat(data.amount) * transferRate;
                setData('received_amount', calculatedAmount.toString());
            }
        } else {
            setData('received_amount', '');
        }
    }, [data.amount, data.destination_account_id, otherAccounts, selectedType, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (transaction) {
            // Update existing transaction
            put(route('transactions.update', { account: account.uuid, transaction: transaction.id }), {
                onSuccess: () => {
                    handleClose();
                    // Optimistic updates are already applied, no need to reload
                },
            });
        } else {
            // Create new transaction
            post(route('transactions.store', account.uuid), {
                onSuccess: () => {
                    handleClose();
                    // Optimistic updates are already applied, no need to reload
                },
            });
        }
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setData('type', type);
        // Reset category and destination account when changing type
        setData('category_id', '');
        setData('destination_account_id', '');
        setCategorySearch('');
        setIsSplitEnabled(false);
        setData('splits', []);
        setIsSharedEnabled(false);
        setData('is_shared', false);
        setData('personal_amount', '');
        setData('shared_receivables', []);
        setDestinationAccountSearch('');
        setPaymentAccountSearch('');
        setContactSearch({});
        setSplitCategorySearch('');
    };

    const handleClose = () => {
        // Reset all form state
        reset();
        setSelectedType('');
        setCategorySearch('');
        setIsSplitEnabled(false);
        setIsSharedEnabled(false);
        setSplitCategorySearch('');
        setDestinationAccountSearch('');
        setPaymentAccountSearch('');
        setContactSearch({});
        // Call parent onClose
        onClose();
    };

    const handleDelete = () => {
        if (!transaction) return;

        if (window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
            router.delete(route('transactions.destroy', [account.uuid, transaction.id]), {
                onSuccess: () => {
                    handleClose();
                    // Optimistic updates are already applied, no need to reload
                },
            });
        }
    };

    const getAvailableCategories = () => {
        const categories = selectedType === 'income' ? incomeCategories : selectedType === 'expense' ? expenseCategories : [];

        if (!categorySearch.trim()) {
            return categories;
        }

        const searchLower = categorySearch.toLowerCase();
        return categories.filter((category) => category.name.toLowerCase().includes(searchLower) || category.emoji.includes(searchLower));
    };

    const splitRows = (data.splits || []) as SplitRow[];
    const sharedRows = (data.shared_receivables || []) as SharedRow[];
    const totalAmount = parseFloat(data.amount) || 0;
    const splitTotal = splitRows.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
    const remainingAmount = totalAmount - splitTotal;
    const sharedTotal = sharedRows.reduce((sum, shared) => sum + (parseFloat(shared.amount) || 0), 0);
    const personalAmount = totalAmount - sharedTotal;
    const paymentAccounts: AccountOption[] = [
        {
            id: account.id,
            name: account.name,
            emoji: account.emoji,
            currency: {
                symbol: account.currency?.symbol || '$',
                name: account.currency?.name || '',
                rate: 1,
            },
        },
        ...otherAccounts,
    ];

    const formatSplitAmount = (amount: number) => {
        const symbol = account.currency?.symbol || '$';
        return `${symbol}${amount.toFixed(2)}`;
    };

    const filterAccounts = (accounts: AccountOption[], search: string) => {
        if (!search.trim()) {
            return accounts;
        }

        const query = search.toLowerCase();

        return accounts.filter(
            (acc) =>
                [acc.name, acc.currency.symbol, acc.currency.name].some((value) => value.toLowerCase().includes(query)) || acc.emoji.includes(search),
        );
    };

    const filteredDestinationAccounts = filterAccounts(otherAccounts, destinationAccountSearch);
    const filteredPaymentAccounts = filterAccounts(paymentAccounts, paymentAccountSearch);

    const filterContacts = (list: Contact[], search: string) => {
        if (!search.trim()) {
            return list;
        }

        const query = search.toLowerCase();

        return list.filter((contact) =>
            [contact.name, contact.email ?? '', contact.phone ?? ''].some((value) => value.toLowerCase().includes(query)),
        );
    };

    useEffect(() => {
        if (!isSharedEnabled) {
            return;
        }

        const nextPersonal = personalAmount > 0 ? personalAmount : 0;
        const formatted = nextPersonal.toFixed(2);

        if (data.personal_amount !== formatted) {
            setData('personal_amount', formatted);
        }
    }, [data.personal_amount, isSharedEnabled, personalAmount, setData]);

    const handleSplitToggle = (checked: boolean) => {
        setIsSplitEnabled(checked);
        setData('category_id', '');
        setSplitCategorySearch('');

        if (checked) {
            setIsSharedEnabled(false);
            setData('is_shared', false);
            setData('personal_amount', '');
            setData('shared_receivables', []);

            if (splitRows.length === 0) {
                setData('splits', [{ category_id: '', amount: '' }]);
            }

            return;
        }

        setData('splits', []);
    };

    const handleSharedToggle = (checked: boolean) => {
        setIsSharedEnabled(checked);
        setData('is_shared', checked);

        if (checked) {
            setIsSplitEnabled(false);
            setData('splits', []);

            if (sharedRows.length === 0) {
                setData('shared_receivables', [{ contact_id: '', amount: '', paid_account_id: '' }]);
            }

            return;
        }

        setData('shared_receivables', []);
        setData('personal_amount', '');
    };

    const getSplitCategories = (rowIndex: number) => {
        const categories = selectedType === 'income' ? incomeCategories : selectedType === 'expense' ? expenseCategories : [];
        const selectedIds = splitRows
            .filter((_, index) => index !== rowIndex)
            .map((split) => split.category_id)
            .filter(Boolean);

        return categories.filter((category) => !selectedIds.includes(category.id.toString()));
    };

    const getSplitCategoriesFiltered = (rowIndex: number) => {
        const categories = getSplitCategories(rowIndex);

        if (!splitCategorySearch.trim()) {
            return categories;
        }

        const searchLower = splitCategorySearch.toLowerCase();
        return categories.filter((category) => category.name.toLowerCase().includes(searchLower) || category.emoji.includes(searchLower));
    };

    const updateSplitRow = (rowIndex: number, field: keyof SplitRow, value: string) => {
        const nextRows = [...splitRows];
        nextRows[rowIndex] = { ...nextRows[rowIndex], [field]: value } as SplitRow;
        setData('splits', nextRows);
    };

    const addSplitRow = () => {
        setData('splits', [...splitRows, { category_id: '', amount: '' }]);
    };

    const removeSplitRow = (rowIndex: number) => {
        if (splitRows.length <= 1) {
            return;
        }

        const nextRows = splitRows.filter((_, index) => index !== rowIndex);
        setData('splits', nextRows);
    };

    const updateSharedRow = (rowIndex: number, field: keyof SharedRow, value: string) => {
        const nextRows = [...sharedRows];
        nextRows[rowIndex] = { ...nextRows[rowIndex], [field]: value } as SharedRow;
        setData('shared_receivables', nextRows);
    };

    const addSharedRow = () => {
        setData('shared_receivables', [...sharedRows, { contact_id: '', amount: '', paid_account_id: '' }]);
    };

    const removeSharedRow = (rowIndex: number) => {
        if (sharedRows.length <= 1) {
            return;
        }

        const nextRows = sharedRows.filter((_, index) => index !== rowIndex);
        setData('shared_receivables', nextRows);
    };

    const getAvailableContacts = (rowIndex: number) => {
        const selectedIds = sharedRows
            .filter((_, index) => index !== rowIndex)
            .map((row) => row.contact_id)
            .filter(Boolean);

        const available = contacts.filter((contact) => !selectedIds.includes(contact.id.toString()));

        return filterContacts(available, contactSearch[rowIndex] ?? '');
    };

    const handleFillRemainder = (rowIndex: number) => {
        const sumOtherRows = splitRows.reduce((sum, split, index) => {
            if (index === rowIndex) {
                return sum;
            }

            return sum + (parseFloat(split.amount) || 0);
        }, 0);

        const remainder = totalAmount - sumOtherRows;
        const safeAmount = remainder > 0 ? remainder : 0;
        updateSplitRow(rowIndex, 'amount', safeAmount.toFixed(2));
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'income':
                return <Plus className="h-4 w-4 text-green-600" />;
            case 'expense':
                return <Minus className="h-4 w-4 text-red-600" />;
            case 'transfer':
                return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
            default:
                return null;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'income':
                return 'border-green-200 bg-green-50 hover:bg-green-100';
            case 'expense':
                return 'border-red-200 bg-red-50 hover:bg-red-100';
            case 'transfer':
                return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
            default:
                return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                >
                    <motion.div
                        className="flex h-[90vh] max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white p-6 shadow-xl md:p-8"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">{transaction ? 'Editar transacción' : 'Nueva transacción'}</h2>
                            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-6">
                            <div className="space-y-4">
                                {/* Transaction Type Selection */}
                                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                                    <Label>Tipo de Transacción</Label>
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                                        {Array.isArray(transactionTypes) &&
                                            transactionTypes.map((type) => (
                                                <motion.button
                                                    key={type.value}
                                                    type="button"
                                                    className={`flex flex-col items-center justify-center rounded-lg border p-3 text-sm transition-colors ${
                                                        selectedType === type.value
                                                            ? getTypeColor(type.value).replace('hover:', '')
                                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => handleTypeChange(type.value)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {getTypeIcon(type.value)}
                                                    <span className="mt-1 font-medium">{type.label}</span>
                                                </motion.button>
                                            ))}
                                    </div>
                                    {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                                </div>

                                <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">{selectedType === 'transfer' ? 'Monto a enviar' : 'Monto'}</Label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                                                        {account.currency?.symbol || '$'}
                                                    </span>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        step="0.01"
                                                        value={data.amount}
                                                        onChange={(e) => setData('amount', e.target.value)}
                                                        className="pl-8"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {selectedType === 'expense' && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className={`h-9 w-9 ${
                                                            isSharedEnabled ? 'border-primary/40 bg-primary/10 text-primary' : 'text-gray-500'
                                                        }`}
                                                        onClick={() => handleSharedToggle(!isSharedEnabled)}
                                                        disabled={isSplitEnabled}
                                                        title="Compartir gasto"
                                                    >
                                                        <Users className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="transaction_date">Fecha</Label>
                                            <div className="relative">
                                                <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                                <Input
                                                    id="transaction_date"
                                                    type="date"
                                                    value={data.transaction_date}
                                                    onChange={(e) => setData('transaction_date', e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.transaction_date && <p className="text-sm text-red-600">{errors.transaction_date}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
                                {/* Category Selection (for income/expense) */}
                                {(selectedType === 'income' || selectedType === 'expense') && !isSplitEnabled && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 space-y-2">
                                                <Label>Categoría</Label>
                                                <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar categoría" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                                                            <Input
                                                                type="text"
                                                                placeholder="Buscar categoría..."
                                                                value={categorySearch}
                                                                onChange={(e) => setCategorySearch(e.target.value)}
                                                                className="h-8"
                                                                onClick={(e) => e.stopPropagation()}
                                                                onKeyDown={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        {getAvailableCategories().length > 0 ? (
                                                            getAvailableCategories().map((category) => (
                                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{category.emoji}</span>
                                                                        <span>{category.name}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                                                                No se encontraron categorías
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                                            </div>
                                            <div className="flex flex-col items-center gap-2 pt-6">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className={`h-9 w-9 ${
                                                        isSplitEnabled ? 'border-primary/40 bg-primary/10 text-primary' : 'text-gray-500'
                                                    }`}
                                                    onClick={() => handleSplitToggle(true)}
                                                    disabled={isSharedEnabled}
                                                    title="Dividir por categoría"
                                                >
                                                    <LayoutGrid className="h-4 w-4" />
                                                </Button>
                                                <span className="text-[11px] text-gray-400">Dividir</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Destination Account (for transfers) */}
                                {selectedType === 'transfer' && (
                                    <div className="space-y-2">
                                        <Label>Cuenta de destino</Label>
                                        <Select
                                            value={data.destination_account_id}
                                            onValueChange={(value) => setData('destination_account_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar cuenta" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Buscar cuenta..."
                                                        value={destinationAccountSearch}
                                                        onChange={(e) => setDestinationAccountSearch(e.target.value)}
                                                        className="h-8"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                {filteredDestinationAccounts.length > 0 ? (
                                                    filteredDestinationAccounts.map((acc) => (
                                                        <SelectItem key={acc.id} value={acc.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <span>{acc.emoji}</span>
                                                                <span>{acc.name}</span>
                                                                <span className="text-sm text-gray-500">({acc.currency.symbol})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                                                        No se encontraron cuentas
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.destination_account_id && <p className="text-sm text-red-600">{errors.destination_account_id}</p>}
                                    </div>
                                )}

                                {/* Received Amount Input (for transfers only) */}
                                {selectedType === 'transfer' && data.destination_account_id && (
                                    <div className="space-y-2">
                                        <Label htmlFor="received_amount">Monto a recibir</Label>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                                                {otherAccounts.find((acc) => acc.id.toString() === data.destination_account_id)?.currency.symbol ||
                                                    '$'}
                                            </span>
                                            <Input
                                                id="received_amount"
                                                type="number"
                                                step="0.01"
                                                value={data.received_amount}
                                                onChange={(e) => setData('received_amount', e.target.value)}
                                                className="pl-8"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {errors.received_amount && <p className="text-sm text-red-600">{errors.received_amount}</p>}
                                    </div>
                                )}

                                {(selectedType === 'income' || selectedType === 'expense') && isSplitEnabled && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm">División por categoría</Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-gray-500"
                                                    onClick={() => handleSplitToggle(false)}
                                                    title="Quitar división"
                                                >
                                                    <LayoutGrid className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            <Button type="button" variant="outline" size="sm" onClick={addSplitRow} className="h-8">
                                                <Plus className="mr-1 h-3.5 w-3.5" />
                                                Agregar
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {splitRows.map((split, index) => (
                                                <div key={`${split.category_id}-${index}`} className="rounded-md border border-gray-100 p-2">
                                                    <div className="flex flex-wrap items-end gap-2">
                                                        <div className="min-w-[180px] flex-1 space-y-1">
                                                            <Label className="text-muted-foreground text-[11px]">Categoría</Label>
                                                            <Select
                                                                value={split.category_id}
                                                                onValueChange={(value) => updateSplitRow(index, 'category_id', value)}
                                                            >
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Seleccionar" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                                                                        <Input
                                                                            type="text"
                                                                            placeholder="Buscar..."
                                                                            value={splitCategorySearch}
                                                                            onChange={(e) => setSplitCategorySearch(e.target.value)}
                                                                            className="h-8"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onKeyDown={(e) => e.stopPropagation()}
                                                                        />
                                                                    </div>
                                                                    {getSplitCategoriesFiltered(index).length > 0 ? (
                                                                        getSplitCategoriesFiltered(index).map((category) => (
                                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span>{category.emoji}</span>
                                                                                    <span>{category.name}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                                                                            No se encontraron categorías
                                                                        </div>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            {splitErrors[`splits.${index}.category_id`] && (
                                                                <p className="text-[11px] text-red-600">
                                                                    {splitErrors[`splits.${index}.category_id`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="w-28 space-y-1">
                                                            <Label className="text-muted-foreground text-[11px]">Monto</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={split.amount}
                                                                onChange={(e) => updateSplitRow(index, 'amount', e.target.value)}
                                                                placeholder="0.00"
                                                                className="h-9"
                                                            />
                                                            {splitErrors[`splits.${index}.amount`] && (
                                                                <p className="text-[11px] text-red-600">{splitErrors[`splits.${index}.amount`]}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                className="h-8 px-2 text-xs"
                                                                onClick={() => handleFillRemainder(index)}
                                                            >
                                                                Restante
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => removeSplitRow(index)}
                                                                disabled={splitRows.length <= 1}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div
                                            className={`flex items-center justify-between rounded-md px-3 py-1 text-[11px] ${
                                                remainingAmount < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                                            }`}
                                        >
                                            <span>Restante</span>
                                            <span>{formatSplitAmount(remainingAmount)}</span>
                                        </div>
                                        {errors.splits && <p className="text-sm text-red-600">{errors.splits}</p>}
                                    </div>
                                )}

                                {selectedType === 'expense' && isSharedEnabled && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Compartido</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addSharedRow} className="h-8">
                                                <Plus className="mr-1 h-3.5 w-3.5" />
                                                Agregar persona
                                            </Button>
                                        </div>

                                        <div className="rounded-md border border-gray-100 p-3">
                                            <Label className="text-muted-foreground text-[11px]">Tu parte</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={data.personal_amount}
                                                readOnly
                                                className="mt-1 h-9 read-only:bg-gray-50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            {sharedRows.map((shared, index) => (
                                                <div key={`${shared.contact_id}-${index}`} className="rounded-md border border-gray-100 p-2">
                                                    <div className="flex flex-wrap items-end gap-2">
                                                        <div className="min-w-[180px] flex-1 space-y-1">
                                                            <Label className="text-muted-foreground text-[11px]">Persona</Label>
                                                            <Select
                                                                value={shared.contact_id}
                                                                onValueChange={(value) => updateSharedRow(index, 'contact_id', value)}
                                                            >
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Seleccionar" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                                                                        <Input
                                                                            type="text"
                                                                            placeholder="Buscar persona..."
                                                                            value={contactSearch[index] ?? ''}
                                                                            onChange={(e) =>
                                                                                setContactSearch((prev) => ({
                                                                                    ...prev,
                                                                                    [index]: e.target.value,
                                                                                }))
                                                                            }
                                                                            className="h-8"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onKeyDown={(e) => e.stopPropagation()}
                                                                        />
                                                                    </div>
                                                                    {getAvailableContacts(index).length > 0 ? (
                                                                        getAvailableContacts(index).map((contact) => (
                                                                            <SelectItem key={contact.id} value={contact.id.toString()}>
                                                                                {contact.name}
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                                                                            No se encontraron personas
                                                                        </div>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            {splitErrors[`shared_receivables.${index}.contact_id`] && (
                                                                <p className="text-[11px] text-red-600">
                                                                    {splitErrors[`shared_receivables.${index}.contact_id`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="w-28 space-y-1">
                                                            <Label className="text-muted-foreground text-[11px]">Monto</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={shared.amount}
                                                                onChange={(e) => updateSharedRow(index, 'amount', e.target.value)}
                                                                placeholder="0.00"
                                                                className="h-9"
                                                            />
                                                            {splitErrors[`shared_receivables.${index}.amount`] && (
                                                                <p className="text-[11px] text-red-600">
                                                                    {splitErrors[`shared_receivables.${index}.amount`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="min-w-[180px] flex-1 space-y-1">
                                                            <Label className="text-muted-foreground text-[11px]">Pagado a (opcional)</Label>
                                                            <Select
                                                                value={shared.paid_account_id}
                                                                onValueChange={(value) => updateSharedRow(index, 'paid_account_id', value)}
                                                            >
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Seleccionar" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                                                                        <Input
                                                                            type="text"
                                                                            placeholder="Buscar cuenta..."
                                                                            value={paymentAccountSearch}
                                                                            onChange={(e) => setPaymentAccountSearch(e.target.value)}
                                                                            className="h-8"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onKeyDown={(e) => e.stopPropagation()}
                                                                        />
                                                                    </div>
                                                                    {filteredPaymentAccounts.length > 0 ? (
                                                                        filteredPaymentAccounts.map((acc) => (
                                                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span>{acc.emoji}</span>
                                                                                    <span>{acc.name}</span>
                                                                                    <span className="text-sm text-gray-500">
                                                                                        ({acc.currency.symbol})
                                                                                    </span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                                                                            No se encontraron cuentas
                                                                        </div>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            {splitErrors[`shared_receivables.${index}.paid_account_id`] && (
                                                                <p className="text-[11px] text-red-600">
                                                                    {splitErrors[`shared_receivables.${index}.paid_account_id`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => removeSharedRow(index)}
                                                                disabled={sharedRows.length <= 1}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div
                                            className={`flex items-center justify-between rounded-md px-3 py-1 text-[11px] ${
                                                personalAmount < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                                            }`}
                                        >
                                            <span>Tu parte</span>
                                            <span>{formatSplitAmount(personalAmount > 0 ? personalAmount : 0)}</span>
                                        </div>
                                        {errors.shared_receivables && <p className="text-sm text-red-600">{errors.shared_receivables}</p>}
                                    </div>
                                )}

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción (opcional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Descripción de la transacción..."
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex gap-3">
                                    {transaction && (
                                        <Button type="button" variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
                                            <Trash2 className="h-4 w-4" />
                                            Eliminar
                                        </Button>
                                    )}
                                    <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={processing || !selectedType || !data.amount} className="flex-1">
                                        {processing
                                            ? transaction
                                                ? 'Actualizando...'
                                                : 'Creando...'
                                            : transaction
                                              ? 'Actualizar transacción'
                                              : 'Crear transacción'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
