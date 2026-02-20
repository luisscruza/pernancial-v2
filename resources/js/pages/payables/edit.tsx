import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Contact, Currency, Payable } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    payable: Payable;
    contacts: Contact[];
    currencies: Currency[];
}

export default function EditPayable({ payable, contacts, currencies }: Props) {
    const form = useForm({
        contact_id: payable.contact_id.toString(),
        currency_id: payable.currency_id.toString(),
        amount_total: payable.amount_total.toString(),
        due_date: payable.due_date,
        description: payable.description ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('payables.update', payable.id));
    };

    return (
        <AppLayout title="Editar CxP">
            <Head title="Editar CxP" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <motion.div className="mb-8 flex items-center gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('payables.show', payable.id)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Editar cuenta por pagar</h1>
                        <p className="text-sm text-gray-500">Actualiza la informacion de la CxP.</p>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Persona</Label>
                                <Select value={form.data.contact_id} onValueChange={(value) => form.setData('contact_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar persona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contacts.map((contact) => (
                                            <SelectItem key={contact.id} value={contact.id.toString()}>
                                                {contact.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.contact_id && <p className="text-sm text-red-600">{form.errors.contact_id}</p>}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Moneda</Label>
                                    <Select value={form.data.currency_id} onValueChange={(value) => form.setData('currency_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar moneda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((currency) => (
                                                <SelectItem key={currency.id} value={currency.id.toString()}>
                                                    {currency.name} ({currency.symbol})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.currency_id && <p className="text-sm text-red-600">{form.errors.currency_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Monto total</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={form.data.amount_total}
                                        onChange={(e) => form.setData('amount_total', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {form.errors.amount_total && <p className="text-sm text-red-600">{form.errors.amount_total}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Vence</Label>
                                    <Input type="date" value={form.data.due_date} onChange={(e) => form.setData('due_date', e.target.value)} />
                                    {form.errors.due_date && <p className="text-sm text-red-600">{form.errors.due_date}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Descripcion</Label>
                                <Input
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Ej: Renta, proveedor"
                                />
                                {form.errors.description && <p className="text-sm text-red-600">{form.errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" asChild className="flex-1">
                            <Link href={route('payables.show', payable.id)}>Cancelar</Link>
                        </Button>
                        <Button type="submit" className="flex-1 gap-2" disabled={form.processing}>
                            <Save className="h-4 w-4" />
                            {form.processing ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
