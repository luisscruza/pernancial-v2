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
    filters,
}: {
    receivables: PaginatedProps<Receivable>;
    accounts: Account[];
    categories: Category[];
    contacts: Contact[];
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
                    className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,_320px)_minmax(0,_220px)_1fr]"
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
                        <Select value={selectedStatus} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unpaid">No pagados / Parcial</SelectItem>
                                <SelectItem value="paid">Pagados</SelectItem>
                                <SelectItem value="all">Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                <motion.div layout className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {groupedReceivables.map(([dueDate, items]) => (
                            <motion.div layout key={dueDate} className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                                    <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase">Vence: {formatDueDate(dueDate)}</p>
                                </div>

                                <div className="space-y-3">
                                    {items.map((receivable) => {
                                        const remaining = Math.max(0, receivable.amount_total - receivable.amount_paid);
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
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                                    {remaining > 0 && (
                                                        <Button size="sm" variant="outline" onClick={() => handleOpenPayment(receivable)}>
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
