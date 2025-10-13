import AppLayout from '@/layouts/app-layout';
import { Account, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { AccountCard } from '@/components/accounts/account-card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/utils/currency';

export default function AccountPage({ accounts }: { accounts: Account[] }) {
    const page = usePage<SharedData>();
    const totalBalance = accounts.reduce((acc, account) => acc + account.balance_in_base, 0);

    return (
        <AppLayout title="Cuentas">
            <Head title="Cuentas" />
            <div className="mx-auto w-full max-w-4xl p-4">
                <motion.div
                    className="mb-8 flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.h1
                        className="text-2xl text-gray-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        Balance total: {formatCurrency(totalBalance, page.props.auth.user.currency)}
                    </motion.h1>
                </motion.div>

                <motion.div layout className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {accounts.map((account, index) => (
                            <motion.div
                                layout
                                key={account.uuid}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{
                                    layout: { duration: 0.3 },
                                    opacity: { duration: 0.3 },
                                    delay: index * 0.1,
                                }}
                            >
                                <AccountCard account={account} />
                            </motion.div>
                        ))}

                          <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.2 }}
                    >
                        <Button variant="default" asChild className="rounded-full bg-accent text-accent-foreground w-full py-6 hover:bg-accent/80 transition-all duration-200">
                            <Link href="/accounts/create" className="gap-2 text-lg font-bold">
                                <PlusIcon className="h-4 w-4" />
                                Nueva cuenta
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Nueva cuenta */}

                    

                        {accounts.length === 0 && (
                            <motion.div
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="rounded-xl border border-dashed border-gray-200 p-8 text-center"
                            >
                                <motion.div
                                    className="text-4xl"
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        delay: 0.2,
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 15
                                    }}
                                >
                                    💰
                                </motion.div>
                                <motion.h3
                                    className="mt-4 text-lg font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    No tienes cuentas
                                </motion.h3>
                                <motion.p
                                    className="mt-2 text-sm text-gray-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Crea tu primera cuenta para empezar a gestionar tus finanzas.
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        variant="default"
                                        asChild
                                        className="mt-6 rounded-full bg-blue-500 hover:bg-blue-600"
                                    >
                                        <a href="/accounts/create" className="gap-2">
                                            <PlusIcon className="h-4 w-4" />
                                            Crear cuenta
                                        </a>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AppLayout>
    );
}
