import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Contact, Currency } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlusIcon } from 'lucide-react';

interface Props {
    contacts: Contact[];
    currencies: Currency[];
    contactId?: number | null;
}

export default function CreateReceivable({ contacts, currencies, contactId }: Props) {
    const form = useForm<{
        contact_id: string;
        currency_id: string;
        amount_total: string;
        due_date: string;
        description: string;
        is_recurring: boolean;
        series_name: string;
        recurrence_frequency: string;
        recurrence_day: string;
    }>({
        contact_id: contactId?.toString() ?? contacts[0]?.id?.toString() ?? '',
        currency_id: currencies[0]?.id?.toString() ?? '',
        amount_total: '',
        due_date: new Date().toISOString().split('T')[0],
        description: '',
        is_recurring: false,
        series_name: '',
        recurrence_frequency: 'monthly',
        recurrence_day: '1',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('receivables.store'));
    };

    return (
        <AppLayout title="Crear CxC">
            <Head title="Crear CxC" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <motion.div className="mb-8 flex items-center gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('receivables.index')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Nueva cuenta por cobrar</h1>
                        <p className="text-sm text-gray-500">Registra un ingreso pendiente o recurrente.</p>
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
                                <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                                    <Label className="text-sm">Recurrente</Label>
                                    <Switch checked={form.data.is_recurring} onCheckedChange={(checked) => form.setData('is_recurring', checked)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Input
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Ej: Salario mensual"
                                />
                                {form.errors.description && <p className="text-sm text-red-600">{form.errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {form.data.is_recurring && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nombre de la serie</Label>
                                    <Input
                                        value={form.data.series_name}
                                        onChange={(e) => form.setData('series_name', e.target.value)}
                                        placeholder="Ej: Salario"
                                    />
                                    {form.errors.series_name && <p className="text-sm text-red-600">{form.errors.series_name}</p>}
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Frecuencia</Label>
                                        <Select
                                            value={form.data.recurrence_frequency}
                                            onValueChange={(value) => form.setData('recurrence_frequency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monthly">Mensual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.recurrence_frequency && (
                                            <p className="text-sm text-red-600">{form.errors.recurrence_frequency}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Día de cobro</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={28}
                                            value={form.data.recurrence_day}
                                            onChange={(e) => form.setData('recurrence_day', e.target.value)}
                                        />
                                        {form.errors.recurrence_day && <p className="text-sm text-red-600">{form.errors.recurrence_day}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" asChild className="flex-1">
                            <Link href={route('receivables.index')}>Cancelar</Link>
                        </Button>
                        <Button type="submit" className="flex-1 gap-2" disabled={form.processing}>
                            <PlusIcon className="h-4 w-4" />
                            {form.processing ? 'Creando...' : 'Crear CxC'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
