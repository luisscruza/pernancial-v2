import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlusIcon } from 'lucide-react';

export default function CreateContact() {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('contacts.store'));
    };

    return (
        <AppLayout title="Crear persona">
            <Head title="Crear persona" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <motion.div className="mb-8 flex items-center gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('contacts.index')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Nueva persona</h1>
                        <p className="text-sm text-gray-500">Crea un contacto para cuentas por cobrar.</p>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Ej: Ana Perez"
                                    autoFocus
                                />
                                {form.errors.name && <p className="text-sm text-red-600">{form.errors.name}</p>}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                    />
                                    {form.errors.email && <p className="text-sm text-red-600">{form.errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder="+34 600 000 000"
                                    />
                                    {form.errors.phone && <p className="text-sm text-red-600">{form.errors.phone}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                    id="notes"
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    placeholder="Detalles relevantes del contacto"
                                    rows={4}
                                />
                                {form.errors.notes && <p className="text-sm text-red-600">{form.errors.notes}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" asChild className="flex-1">
                            <Link href={route('contacts.index')}>Cancelar</Link>
                        </Button>
                        <Button type="submit" className="flex-1 gap-2" disabled={form.processing}>
                            <PlusIcon className="h-4 w-4" />
                            {form.processing ? 'Creando...' : 'Crear persona'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
