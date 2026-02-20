import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Account, Category, PaginatedProps, Payable, SharedData } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const statusStyles: Record<string, string> = {
    open: 'bg-amber-50 text-amber-700',
    partial: 'bg-blue-50 text-blue-700',
    paid: 'bg-emerald-50 text-emerald-700',
};

export default function PayablesIndex({
    payables,
    accounts,
    categories,
}: {
    payables: PaginatedProps<Payable>;
    accounts: Account[];
    categories: Category[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [activePayable, setActivePayable] = useState<Payable | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [accountSearch, setAccountSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const { data, errors, post, processing, reset, setData } = useForm({
        account_id: '',
        amount: '',
        paid_at: new Date().toISOString().split('T')[0],
        note: '',
        category_id: '',
    });

    const remainingAmount = useMemo(() => {
        if (!activePayable) {
            return 0;
        }

        return Math.max(0, activePayable.amount_total - activePayable.amount_paid);
    }, [activePayable]);

    useEffect(() => {
        if (!activePayable) {
            return;
        }

        setData({
            account_id: accounts[0]?.id?.toString() ?? '',
            amount: remainingAmount.toFixed(2),
            paid_at: new Date().toISOString().split('T')[0],
            note: '',
            category_id: '',
        });
    }, [activePayable, accounts, remainingAmount, setData]);

    const filteredAccounts = useMemo(() => {
        const query = accountSearch.trim().toLowerCase();

        if (!query) {
            return accounts;
        }

        return accounts.filter((account) => {
            const label = `${account.name} ${account.currency?.symbol ?? ''}`.toLowerCase();
            return label.includes(query);
        });
    }, [accounts, accountSearch]);

    const filteredCategories = useMemo(() => {
        const query = categorySearch.trim().toLowerCase();

        if (!query) {
            return categories;
        }

        return categories.filter((category) => {
            const label = `${category.name} ${category.emoji}`.toLowerCase();
            return label.includes(query);
        });
    }, [categories, categorySearch]);

    const handleOpenPayment = (payable: Payable) => {
        setActivePayable(payable);
        setIsPaymentOpen(true);
        setAccountSearch('');
        setCategorySearch('');
    };

    const handleClosePayment = () => {
        setIsPaymentOpen(false);
        setActivePayable(null);
        reset();
        setAccountSearch('');
        setCategorySearch('');
    };

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activePayable) {
            return;
        }

        post(route('payables.payments.store', activePayable.id), {
            onSuccess: () => handleClosePayment(),
        });
    };

    return (
        <AppLayout title="Cuentas por pagar">
            <Head title="Cuentas por pagar" />
            <div className="ml-8 w-full max-w-7xl p-4">
                <motion.div className="mb-6 flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Cuentas por pagar</h1>
                        <p className="text-sm text-gray-500">Controla lo que debes y registra pagos.</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href={route('payables.create')}>
                            <PlusIcon className="h-4 w-4" />
                            Nueva CxP
                        </Link>
                    </Button>
                </motion.div>

                <motion.div layout className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {payables.data.map((payable) => {
                            const remaining = Math.max(0, payable.amount_total - payable.amount_paid);
                            return (
                                <motion.div
                                    layout
                                    key={payable.id}
                                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold text-gray-900">{payable.contact?.name}</h3>
                                                <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyles[payable.status]}`}>
                                                    {payable.status === 'open' ? 'Pendiente' : payable.status === 'partial' ? 'Parcial' : 'Pagada'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">Vence: {new Date(payable.due_date).toLocaleDateString()}</p>
                                            {payable.description && <p className="text-sm text-gray-500">{payable.description}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total</p>
                                            <p className="text-lg font-semibold">
                                                {formatCurrency(payable.amount_total, payable.currency ?? auth.user.currency)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Pendiente: {formatCurrency(remaining, payable.currency ?? auth.user.currency)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleOpenPayment(payable)}>
                                            Registrar pago
                                        </Button>
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={route('payables.show', payable.id)}>Ver detalle</Link>
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {payables.data.length === 0 && (
                    <motion.div
                        className="mt-8 rounded-xl border border-dashed border-gray-200 p-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-4xl">📤</div>
                        <h3 className="mt-4 text-lg font-medium">No tienes cuentas por pagar</h3>
                        <p className="mt-2 text-sm text-gray-500">Crea tu primera cuenta por pagar para empezar.</p>
                        <Button asChild className="mt-6 gap-2">
                            <Link href={route('payables.create')}>
                                <PlusIcon className="h-4 w-4" />
                                Crear CxP
                            </Link>
                        </Button>
                    </motion.div>
                )}
            </div>

            <Dialog open={isPaymentOpen} onOpenChange={(open) => !open && handleClosePayment()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Registrar pago</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPayment} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cuenta de pago</Label>
                            <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar cuenta" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                                        <Input
                                            type="text"
                                            placeholder="Buscar cuenta..."
                                            value={accountSearch}
                                            onChange={(e) => setAccountSearch(e.target.value)}
                                            className="h-8"
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    {filteredAccounts.length > 0 ? (
                                        filteredAccounts.map((account) => (
                                            <SelectItem key={account.id} value={account.id.toString()}>
                                                {account.name} ({account.currency?.symbol})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground px-2 py-6 text-center text-sm">No se encontraron cuentas</div>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.account_id && <p className="text-sm text-red-600">{errors.account_id}</p>}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Monto</Label>
                                <Input type="number" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                                {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de pago</Label>
                                <Input type="date" value={data.paid_at} onChange={(e) => setData('paid_at', e.target.value)} />
                                {errors.paid_at && <p className="text-sm text-red-600">{errors.paid_at}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Categoría (opcional)</Label>
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
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <span>{category.emoji}</span>
                                                    <span>{category.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground px-2 py-6 text-center text-sm">No se encontraron categorías</div>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Nota</Label>
                            <Input value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Opcional" />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={handleClosePayment}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Registrando...' : 'Registrar pago'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
