import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ArrowRightLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account } from '@/types';

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

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: Account;
    incomeCategories: Category[];
    expenseCategories: Category[];
    otherAccounts: OtherAccount[];
    transactionTypes: TransactionType[];
}

export default function TransactionModal({
    isOpen,
    onClose,
    account,
    incomeCategories,
    expenseCategories,
    otherAccounts,
    transactionTypes,
}: TransactionModalProps) {
    const [selectedType, setSelectedType] = useState<string>('');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        type: '',
        amount: '',
        description: '',
        category_id: '',
        destination_account_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('transactions.store', account.uuid), {
            onSuccess: () => {
                reset();
                setSelectedType('');
                onClose();
            },
        });
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setData('type', type);
        // Reset category and destination account when changing type
        setData('category_id', '');
        setData('destination_account_id', '');
    };

    const handleClose = () => {
        reset();
        setSelectedType('');
        onClose();
    };

    const getAvailableCategories = () => {
        if (selectedType === 'income') return incomeCategories;
        if (selectedType === 'expense') return expenseCategories;
        return [];
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
                        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Nueva transacción</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClose}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Transaction Type Selection */}
                            <div className="space-y-3">
                                <Label>Tipo de Transacción</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {transactionTypes.map((type) => (
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
                                {errors.type && (
                                    <p className="text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-2">
                                <Label htmlFor="amount">Monto</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
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
                                {errors.amount && (
                                    <p className="text-sm text-red-600">{errors.amount}</p>
                                )}
                            </div>

                            {/* Category Selection (for income/expense) */}
                            {(selectedType === 'income' || selectedType === 'expense') && (
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) => setData('category_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getAvailableCategories().map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{category.emoji}</span>
                                                        <span>{category.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="text-sm text-red-600">{errors.category_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Destination Account (for transfers) */}
                            {selectedType === 'transfer' && (
                                <div className="space-y-2">
                                    <Label>Cuenta de Destino</Label>
                                    <Select
                                        value={data.destination_account_id}
                                        onValueChange={(value) => setData('destination_account_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar cuenta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {otherAccounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{acc.emoji}</span>
                                                        <span>{acc.name}</span>
                                                        <span className="text-sm text-gray-500">
                                                            ({acc.currency.symbol})
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.destination_account_id && (
                                        <p className="text-sm text-red-600">{errors.destination_account_id}</p>
                                    )}
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
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <Label htmlFor="transaction_date">Fecha</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        id="transaction_date"
                                        type="date"
                                        value={data.transaction_date}
                                        onChange={(e) => setData('transaction_date', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                {errors.transaction_date && (
                                    <p className="text-sm text-red-600">{errors.transaction_date}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !selectedType || !data.amount}
                                    className="flex-1"
                                >
                                    {processing ? 'Creando...' : 'Crear transacción'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}