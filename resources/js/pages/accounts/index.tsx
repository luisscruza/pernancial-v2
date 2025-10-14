import AppLayout from '@/layouts/app-layout';
import { Account, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { AccountCard } from '@/components/accounts/account-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/utils/currency';
import { useState, useMemo } from 'react';

export default function AccountPage({ accounts }: { accounts: Account[] }) {
    const page = usePage<SharedData>();
    const [searchQuery, setSearchQuery] = useState('');
    
    // Calculate accounting stats
    const accountingStats = useMemo(() => {
        const cuentasPorPagar = accounts
            .filter(account => account.accounting_type === 'cxp')
            .reduce((acc, account) => acc + account.balance_in_base, 0);
        
        const cuentasPorCobrar = accounts
            .filter(account => account.accounting_type === 'cxc')
            .reduce((acc, account) => acc + account.balance_in_base, 0);
        
        const balanceEnCuenta = accounts
            .filter(account => account.accounting_type === 'normal')
            .reduce((acc, account) => acc + account.balance_in_base, 0);
        
        const totalGeneral = balanceEnCuenta + cuentasPorCobrar - cuentasPorPagar;
        
        return {
            cuentasPorPagar,
            cuentasPorCobrar,
            balanceEnCuenta,
            totalGeneral
        };
    }, [accounts]);

    // Filter accounts by search query
    const filteredAccounts = useMemo(() => {
        if (!searchQuery.trim()) return accounts;
        
        const query = searchQuery.toLowerCase();
        return accounts.filter(account => 
            account.name.toLowerCase().includes(query)
        );
    }, [accounts, searchQuery]);

    // Group accounts by type
    const groupedAccounts = useMemo(() => {
        const groups: Record<string, Account[]> = {};
        
        filteredAccounts.forEach(account => {
            const type = account.type || 'general';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(account);
        });
        
        return groups;
    }, [filteredAccounts]);

    // Define type order and labels
    const typeLabels: Record<string, string> = {
        'cash': 'Efectivo',
        'bank': 'Banco',
        'savings': 'Ahorro',
        'checking': 'Cuenta corriente',
        'credit_card': 'Tarjeta de crédito',
        'debit_card': 'Tarjeta de débito',
        'investment': 'Inversión',
        'cxc': 'Cuentas por cobrar',
        'cxp': 'Cuentas por pagar',
        'general': 'General',
    };

    const typeOrder = ['cash', 'bank', 'savings', 'checking', 'debit_card', 'credit_card', 'investment', 'cxc', 'cxp', 'general'];
    
    // Sort groups by defined order
    const sortedGroups = Object.entries(groupedAccounts).sort((a, b) => {
        const indexA = typeOrder.indexOf(a[0]);
        const indexB = typeOrder.indexOf(b[0]);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    return (
        <AppLayout title="Cuentas">
            <Head title="Cuentas" />
            <div className="mx-auto w-full max-w-4xl p-4">
                {/* Stats Cards */}
                <motion.div
                    className="mb-6 grid grid-cols-2 gap-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Balance en cuenta */}
                    <div className="rounded-xl border border-gray-50 bg-white p-4">
                        <p className="text-xs text-gray-500 mb-1">Balance en cuenta</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(accountingStats.balanceEnCuenta, page.props.auth.user.currency)}
                        </p>
                    </div>

                    {/* Cuentas por cobrar */}
                    <div className="rounded-xl border border-gray-50 bg-white p-4">
                        <p className="text-xs text-gray-500 mb-1">Cuentas por cobrar</p>
                        <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(accountingStats.cuentasPorCobrar, page.props.auth.user.currency)}
                        </p>
                    </div>

                    {/* Cuentas por pagar */}
                    <div className="rounded-xl border border-gray-50 bg-white p-4">
                        <p className="text-xs text-gray-500 mb-1">Cuentas por pagar</p>
                        <p className="text-lg font-semibold text-red-600">
                            {formatCurrency(accountingStats.cuentasPorPagar, page.props.auth.user.currency)}
                        </p>
                    </div>

                    {/* Total general */}
                    <div className="rounded-xl border border-gray-50 bg-white p-4">
                        <p className="text-xs text-gray-500 mb-1">Total general</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(accountingStats.totalGeneral, page.props.auth.user.currency)}
                        </p>
                    </div>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Buscar cuentas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </motion.div>

                <motion.div layout className="space-y-8">
                    <AnimatePresence mode="popLayout">
                        {sortedGroups.map(([type, typeAccounts], groupIndex) => (
                            <motion.div
                                key={type}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{
                                    layout: { duration: 0.3 },
                                    opacity: { duration: 0.3 },
                                    delay: groupIndex * 0.05,
                                }}
                                className="space-y-3"
                            >
                                {/* Group Header */}
                                <motion.h2
                                    className="text-sm font-semibold text-gray-500 uppercase tracking-wide"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: groupIndex * 0.05 + 0.1 }}
                                >
                                    {typeLabels[type] || type}
                                </motion.h2>

                                {/* Accounts in this group */}
                                <div className="grid gap-3">
                                    {typeAccounts.map((account, index) => (
                                        <motion.div
                                            layout
                                            key={account.uuid}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{
                                                layout: { duration: 0.3 },
                                                opacity: { duration: 0.3 },
                                                delay: groupIndex * 0.05 + index * 0.05,
                                            }}
                                        >
                                            <AccountCard account={account} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {/* Nueva cuenta button */}
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

                        {/* Empty state */}
                        {filteredAccounts.length === 0 && (
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
                                    {searchQuery ? '�' : '�💰'}
                                </motion.div>
                                <motion.h3
                                    className="mt-4 text-lg font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {searchQuery ? 'No se encontraron cuentas' : 'No tienes cuentas'}
                                </motion.h3>
                                <motion.p
                                    className="mt-2 text-sm text-gray-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {searchQuery 
                                        ? `No hay cuentas que coincidan con "${searchQuery}"`
                                        : 'Crea tu primera cuenta para empezar a gestionar tus finanzas.'
                                    }
                                </motion.p>
                                {!searchQuery && (
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
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AppLayout>
    );
}
