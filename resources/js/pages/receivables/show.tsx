import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Account, Category, Receivable, SharedData } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const statusStyles: Record<string, string> = {
    open: 'bg-amber-50 text-amber-700',
    partial: 'bg-blue-50 text-blue-700',
    paid: 'bg-emerald-50 text-emerald-700',
};

export default function ReceivableShow({
    receivable,
    accounts,
    categories,
}: {
    receivable: Receivable;
    accounts: Account[];
    categories: Category[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [accountSearch, setAccountSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const { data, errors, post, processing, setData } = useForm({
        account_id: accounts[0]?.id?.toString() ?? '',
        amount: '',
        paid_at: new Date().toISOString().split('T')[0],
        note: '',
        category_id: '',
    });

    const remainingAmount = useMemo(() => Math.max(0, receivable.amount_total - receivable.amount_paid), [receivable]);

    useEffect(() => {
        setData('amount', remainingAmount.toFixed(2));
    }, [remainingAmount, setData]);

    useEffect(() => {
        if (!isPaymentOpen) {
            return;
        }

        setAccountSearch('');
        setCategorySearch('');
    }, [isPaymentOpen]);

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

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('receivables.payments.store', receivable.id), {
            onSuccess: () => setIsPaymentOpen(false),
        });
    };

    return (
        <AppLayout title="Detalle CxC">
            <Head title="Detalle CxC" />
            <div className="ml-8 w-full max-w-7xl space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('receivables.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">{receivable.contact?.name}</h1>
                            <p className="text-sm text-gray-500">Vence: {new Date(receivable.due_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('receivables.edit', receivable.id)}>Editar</Link>
                        </Button>
                        {remainingAmount > 0 && <Button onClick={() => setIsPaymentOpen(true)}>Registrar cobro</Button>}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${statusStyles[receivable.status]}`}>
                                {receivable.status === 'open' ? 'Pendiente' : receivable.status === 'partial' ? 'Parcial' : 'Pagada'}
                            </span>
                            {receivable.description && <p className="mt-3 text-sm text-gray-600">{receivable.description}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-2xl font-semibold">
                                {formatCurrency(receivable.amount_total, receivable.currency ?? auth.user.currency)}
                            </p>
                            <p className="text-sm text-gray-500">
                                Pendiente: {formatCurrency(remainingAmount, receivable.currency ?? auth.user.currency)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Pagos registrados</h2>
                    {receivable.payments && receivable.payments.length > 0 ? (
                        <div className="mt-4 space-y-3">
                            {receivable.payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{payment.account?.name ?? 'Cuenta'}</p>
                                        <p className="text-xs text-gray-500">{new Date(payment.paid_at).toLocaleDateString()}</p>
                                        {payment.note && <p className="text-xs text-gray-500">{payment.note}</p>}
                                    </div>
                                    <p className="text-sm font-semibold">
                                        {formatCurrency(payment.amount, receivable.currency ?? auth.user.currency)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-gray-500">Aun no hay pagos registrados.</p>
                    )}
                </div>
            </div>

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Registrar cobro</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPayment} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cuenta destino</Label>
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
                            <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
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
