import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Contact } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';

function ContactCard({ contact }: { contact: Contact }) {
    return (
        <Link href={route('contacts.show', contact.id)}>
            <motion.div
                layout
                className="mb-2 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">{contact.name}</h3>
                    <div className="text-sm text-gray-500">
                        {contact.email && <span>{contact.email}</span>}
                        {contact.email && contact.phone && <span className="mx-2">•</span>}
                        {contact.phone && <span>{contact.phone}</span>}
                    </div>
                </div>
                <span className="text-xs text-gray-400">Ver</span>
            </motion.div>
        </Link>
    );
}

export default function ContactsIndex({ contacts }: { contacts: Contact[] }) {
    return (
        <AppLayout title="Personas">
            <Head title="Personas" />
            <div className="ml-8 w-full max-w-7xl p-4">
                <motion.div className="mb-6 flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Contactos</h1>
                        <p className="text-sm text-gray-500">Gestiona tus contactos. </p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href={route('contacts.create')}>
                            <PlusIcon className="h-4 w-4" />
                            Nueva persona
                        </Link>
                    </Button>
                </motion.div>

                <motion.div layout className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {contacts.map((contact) => (
                            <ContactCard key={contact.id} contact={contact} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {contacts.length === 0 && (
                    <motion.div
                        className="mt-8 rounded-xl border border-dashed border-gray-200 p-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-4xl">👥</div>
                        <h3 className="mt-4 text-lg font-medium">No tienes personas aún</h3>
                        <p className="mt-2 text-sm text-gray-500">Crea tu primer contacto para registrar cuentas por cobrar.</p>
                        <Button asChild className="mt-6 gap-2">
                            <Link href={route('contacts.create')}>
                                <PlusIcon className="h-4 w-4" />
                                Crear persona
                            </Link>
                        </Button>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
