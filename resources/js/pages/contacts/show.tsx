import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Contact, Payable, Receivable, SharedData, Transaction } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Pencil } from 'lucide-react';

interface Props extends SharedData {
    contact: Contact;
    receivables: Receivable[];
    payables: Payable[];
    transactions: Transaction[];
    totals: {
        owed_to_you: number;
        you_owe: number;
    };
}

export default function ContactShow({ contact, receivables, payables, transactions, totals }: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout title={contact.name}>
            <Head title={contact.name} />
            <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('contacts.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">{contact.name}</h1>
                            <p className="text-sm text-gray-500">
                                {contact.email && <span>{contact.email}</span>}
                                {contact.email && contact.phone && <span className="mx-2">•</span>}
                                {contact.phone && <span>{contact.phone}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" className="gap-2">
                            <Link href={route('receivables.create', { contact_id: contact.id })}>+ CxC</Link>
                        </Button>
                        <Button asChild variant="outline" className="gap-2">
                            <Link href={route('payables.create', { contact_id: contact.id })}>+ CxP</Link>
                        </Button>
                        <Button asChild variant="outline" className="gap-2">
                            <Link href={route('contacts.edit', contact.id)}>
                                <Pencil className="h-4 w-4" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">Me debe</p>
                        <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(totals.owed_to_you, auth.user.currency)}</p>
                        <p className="text-xs text-gray-500">Cuentas por cobrar pendientes</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">Le debo</p>
                        <p className="text-2xl font-semibold text-red-600">{formatCurrency(totals.you_owe, auth.user.currency)}</p>
                        <p className="text-xs text-gray-500">Cuentas por pagar pendientes</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">Movimientos</p>
                        <p className="text-2xl font-semibold text-gray-900">{transactions.length}</p>
                        <p className="text-xs text-gray-500">Pagos registrados</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Cuentas por cobrar</h2>
                        {receivables.length > 0 ? (
                            <div className="mt-4 space-y-3">
                                {receivables.map((receivable) => (
                                    <div key={receivable.id} className="rounded-lg border border-gray-100 p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{receivable.description || 'Sin descripción'}</p>
                                                <p className="text-xs text-gray-500">Vence: {new Date(receivable.due_date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-emerald-600">
                                                    {formatCurrency(
                                                        receivable.amount_total - receivable.amount_paid,
                                                        receivable.currency ?? auth.user.currency,
                                                    )}
                                                </p>
                                                <Badge variant="secondary" className="mt-1">
                                                    {receivable.status === 'open'
                                                        ? 'Pendiente'
                                                        : receivable.status === 'partial'
                                                          ? 'Parcial'
                                                          : 'Pagada'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500">No hay cuentas por cobrar.</p>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Cuentas por pagar</h2>
                        {payables.length > 0 ? (
                            <div className="mt-4 space-y-3">
                                {payables.map((payable) => (
                                    <div key={payable.id} className="rounded-lg border border-gray-100 p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{payable.description || 'Sin descripción'}</p>
                                                <p className="text-xs text-gray-500">Vence: {new Date(payable.due_date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-red-600">
                                                    {formatCurrency(
                                                        payable.amount_total - payable.amount_paid,
                                                        payable.currency ?? auth.user.currency,
                                                    )}
                                                </p>
                                                <Badge variant="secondary" className="mt-1">
                                                    {payable.status === 'open' ? 'Pendiente' : payable.status === 'partial' ? 'Parcial' : 'Pagada'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500">No hay cuentas por pagar.</p>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Transacciones</h2>
                    {transactions.length > 0 ? (
                        <div className="mt-4 space-y-3">
                            {transactions.map((transaction) => (
                                <motion.div
                                    key={transaction.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{transaction.description || 'Transacción'}</p>
                                        <p className="text-xs text-gray-500">{new Date(transaction.transaction_date).toLocaleDateString()}</p>
                                        <p className="text-xs text-gray-500">{transaction.account?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {formatCurrency(transaction.amount, transaction.account?.currency ?? auth.user.currency)}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-gray-500">Aun no hay transacciones registradas.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
