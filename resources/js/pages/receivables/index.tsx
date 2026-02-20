import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Account, Category, Contact, PaginatedProps, Receivable, SharedData } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const statusStyles: Record<string, string> = {
    open: 'bg-amber-50 text-amber-700',
    partial: 'bg-blue-50 text-blue-700',
    paid: 'bg-emerald-50 text-emerald-700',
};

export default function ReceivablesIndex({
    receivables,
    accounts,
    categories,
    contacts,
    summary,
    filters,
}: {
    receivables: PaginatedProps<Receivable>;
    accounts: Account[];
    categories: Category[];
    contacts: Contact[];
    summary: {
        pending_count: number;
        pending_amount: number;
        overdue_count: number;
        overdue_amount: number;
        due_today_count: number;
        due_today_amount: number;
        due_soon_count: number;
        due_soon_amount: number;
        paid_count: number;
        paid_amount: number;
    };
    filters: {
        contact_id?: number | null;
        status?: string | null;
    };
}) {
    const { auth } = usePage<SharedData>().props;
    const [activeReceivable, setActiveReceivable] = useState<Receivable | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [accountSearch, setAccountSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const [contactSearch, setContactSearch] = useState('');
    const { data, errors, post, processing, reset, setData } = useForm({
        account_id: '',
        amount: '',
        paid_at: new Date().toISOString().split('T')[0],
        note: '',
        category_id: '',
    });

    const remainingAmount = useMemo(() => {
        if (!activeReceivable) {
            return 0;
        }

        return Math.max(0, activeReceivable.amount_total - activeReceivable.amount_paid);
    }, [activeReceivable]);

    useEffect(() => {
        if (!activeReceivable) {
            return;
        }

        setData({
            account_id: accounts[0]?.id?.toString() ?? '',
            amount: remainingAmount.toFixed(2),
            paid_at: new Date().toISOString().split('T')[0],
            note: '',
            category_id: '',
        });
    }, [activeReceivable, accounts, remainingAmount, setData]);

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

    const filteredContacts = useMemo(() => {
        const query = contactSearch.trim().toLowerCase();

        if (!query) {
            return contacts;
        }

        return contacts.filter((contact) => contact.name.toLowerCase().includes(query));
    }, [contacts, contactSearch]);

    const groupedReceivables = useMemo(() => {
        const groups = new Map<string, Receivable[]>();

        receivables.data.forEach((receivable) => {
            const key = receivable.due_date;
            const group = groups.get(key);

            if (group) {
                group.push(receivable);
            } else {
                groups.set(key, [receivable]);
            }
        });

        return Array.from(groups.entries());
    }, [receivables.data]);

    const selectedContact = filters.contact_id ? filters.contact_id.toString() : 'all';
    const selectedStatus = filters.status ?? 'unpaid';

    const handleOpenPayment = (receivable: Receivable) => {
        setActiveReceivable(receivable);
        setIsPaymentOpen(true);
        setAccountSearch('');
        setCategorySearch('');
    };

    const handleClosePayment = () => {
        setIsPaymentOpen(false);
        setActiveReceivable(null);
        reset();
        setAccountSearch('');
        setCategorySearch('');
    };

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeReceivable) {
            return;
        }

        post(route('receivables.payments.store', activeReceivable.id), {
            onSuccess: () => handleClosePayment(),
        });
    };

    const handleContactFilterChange = (value: string) => {
        const contactId = value === 'all' ? null : Number(value);

        router.get(
            route('receivables.index'),
            {
                contact_id: contactId ?? undefined,
                status: selectedStatus,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleStatusFilterChange = (value: string) => {
        router.get(
            route('receivables.index'),
            {
                contact_id: selectedContact === 'all' ? undefined : Number(selectedContact),
                status: value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const formatDueDate = (value: string) => new Date(value).toLocaleDateString();
    const getDueMeta = (value: string) => {
        const dueDate = new Date(`${value}T00:00:00`);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dayMs = 24 * 60 * 60 * 1000;
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / dayMs);

        if (diffDays < 0) {
            return { label: 'Vencida', className: 'bg-red-100 text-red-700' };
        }

        if (diffDays === 0) {
            return { label: 'Vence hoy', className: 'bg-amber-100 text-amber-700' };
        }

        if (diffDays <= 7) {
            return { label: `En ${diffDays} dias`, className: 'bg-blue-100 text-blue-700' };
        }

        return { label: `En ${diffDays} dias`, className: 'bg-gray-100 text-gray-600' };
    };

    return (
        <AppLayout title="Cuentas por cobrar">
            <Head title="Cuentas por cobrar" />
            <div className="ml-8 w-full max-w-7xl p-4">
                <motion.div className="mb-6 flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Cuentas por cobrar</h1>
                        <p className="text-sm text-gray-500">Controla lo que te deben y registra cobros.</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href={route('receivables.create')}>
                            <PlusIcon className="h-4 w-4" />
                            Nueva CxC
                        </Link>
                    </Button>
                </motion.div>

                <motion.div
                    className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <p className="text-xs text-gray-500">Pendientes</p>
                        <p className="text-base font-semibold text-gray-900">{formatCurrency(summary.pending_amount, auth.user.currency)}</p>
                        <p className="text-xs text-gray-400">{summary.pending_count} cuentas</p>
                    </div>
                    <div className="rounded-xl border border-red-100 bg-white p-3">
                        <p className="text-xs text-gray-500">Vencidas</p>
                        <p className="text-base font-semibold text-red-600">{formatCurrency(summary.overdue_amount, auth.user.currency)}</p>
                        <p className="text-xs text-gray-400">{summary.overdue_count} cuentas</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-white p-3">
                        <p className="text-xs text-gray-500">Vence hoy</p>
                        <p className="text-base font-semibold text-amber-700">{formatCurrency(summary.due_today_amount, auth.user.currency)}</p>
                        <p className="text-xs text-gray-400">{summary.due_today_count} cuentas</p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-white p-3">
                        <p className="text-xs text-gray-500">Proximos 7 dias</p>
                        <p className="text-base font-semibold text-blue-700">{formatCurrency(summary.due_soon_amount, auth.user.currency)}</p>
                        <p className="text-xs text-gray-400">{summary.due_soon_count} cuentas</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white p-3">
                        <p className="text-xs text-gray-500">Pagadas</p>
                        <p className="text-base font-semibold text-emerald-700">{formatCurrency(summary.paid_amount, auth.user.currency)}</p>
                        <p className="text-xs text-gray-400">{summary.paid_count} cuentas</p>
                    </div>
                </motion.div>

                <motion.div
                    className="sticky top-4 z-10 mb-6 grid gap-3 rounded-xl border border-gray-100 bg-white/90 p-3 backdrop-blur sm:grid-cols-[minmax(0,_320px)_minmax(0,_220px)_1fr]"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="space-y-2">
                        <Label>Filtrar por contacto</Label>
                        <Select
                            value={selectedContact}
                            onValueChange={(value) => {
                                setContactSearch('');
                                handleContactFilterChange(value);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los contactos" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="sticky top-0 z-10 bg-white px-2 pb-2">
                                    <Input
                                        type="text"
                                        placeholder="Buscar contacto..."
                                        value={contactSearch}
                                        onChange={(e) => setContactSearch(e.target.value)}
                                        className="h-8"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <SelectItem value="all">Todos los contactos</SelectItem>
                                {filteredContacts.length > 0 ? (
                                    filteredContacts.map((contact) => (
                                        <SelectItem key={contact.id} value={contact.id.toString()}>
                                            {contact.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="text-muted-foreground px-2 py-6 text-center text-sm">No se encontraron contactos</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Estado</Label>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={selectedStatus === 'unpaid' ? 'secondary' : 'outline'}
                                onClick={() => handleStatusFilterChange('unpaid')}
                            >
                                No pagados / Parcial
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={selectedStatus === 'paid' ? 'secondary' : 'outline'}
                                onClick={() => handleStatusFilterChange('paid')}
                            >
                                Pagados
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={selectedStatus === 'all' ? 'secondary' : 'outline'}
                                onClick={() => handleStatusFilterChange('all')}
                            >
                                Todos
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <motion.div layout className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {groupedReceivables.map(([dueDate, items]) => (
                            <motion.div layout key={dueDate} className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                {(() => {
                                    const meta = getDueMeta(dueDate);
                                    return (
                                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                                            <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                                                Vence: {formatDueDate(dueDate)}
                                            </p>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
                                        </div>
                                    );
                                })()}

                                <div className="space-y-3">
                                    {items.map((receivable) => {
                                        const remaining = Math.max(0, receivable.amount_total - receivable.amount_paid);
                                        const progress =
                                            receivable.amount_total > 0
                                                ? Math.min(100, Math.round((receivable.amount_paid / receivable.amount_total) * 100))
                                                : 0;
                                        return (
                                            <div key={receivable.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-base font-semibold text-gray-900">{receivable.contact?.name}</h3>
                                                            <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyles[receivable.status]}`}>
                                                                {receivable.status === 'open'
                                                                    ? 'Pendiente'
                                                                    : receivable.status === 'partial'
                                                                      ? 'Parcial'
                                                                      : 'Pagada'}
                                                            </span>
                                                        </div>
                                                        {receivable.description && <p className="text-sm text-gray-500">{receivable.description}</p>}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">Total</p>
                                                        <p className="text-lg font-semibold">
                                                            {formatCurrency(receivable.amount_total, receivable.currency ?? auth.user.currency)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Pendiente: {formatCurrency(remaining, receivable.currency ?? auth.user.currency)}
                                                        </p>
                                                        {receivable.amount_paid > 0 && remaining > 0 && (
                                                            <div className="mt-2">
                                                                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                                                                    <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                                                                </div>
                                                                <p className="mt-1 text-[11px] text-gray-400">{progress}% cobrado</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                                    {remaining > 0 && (
                                                        <Button size="sm" variant="default" onClick={() => handleOpenPayment(receivable)}>
                                                            Registrar cobro
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={route('receivables.show', receivable.id)}>Ver detalle</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {receivables.data.length === 0 && (
                    <motion.div
                        className="mt-8 rounded-xl border border-dashed border-gray-200 p-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-4xl">📥</div>
                        <h3 className="mt-4 text-lg font-medium">No tienes cuentas por cobrar</h3>
                        <p className="mt-2 text-sm text-gray-500">Crea tu primera cuenta por cobrar para empezar.</p>
                        <Button asChild className="mt-6 gap-2">
                            <Link href={route('receivables.create')}>
                                <PlusIcon className="h-4 w-4" />
                                Crear CxC
                            </Link>
                        </Button>
                    </motion.div>
                )}
            </div>

            <Dialog open={isPaymentOpen} onOpenChange={(open) => !open && handleClosePayment()}>
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
