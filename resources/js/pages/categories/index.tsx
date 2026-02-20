import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { categoryLabel } from '@/lib/labels';
import { Category } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';

interface CategoryItemProps {
    category: Category;
}

function CategoryItem({ category }: CategoryItemProps) {
    return (
        <Link href={route('categories.show', category.uuid)}>
            <motion.div
                layout
                className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-2xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 15,
                        }}
                    >
                        {category.emoji}
                    </motion.div>
                    <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{categoryLabel(category.type)}</p>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

export default function CategoriesPage({ categories }: { categories: Category[] }) {
    const expenseCategories = categories.filter((category) => category.type === 'expense');
    const incomeCategories = categories.filter((category) => category.type === 'income');

    return (
        <AppLayout title="Categorías">
            <Head title="Categorías" />
            <div className="ml-8 w-full max-w-7xl p-4">
                <motion.div
                    className="mb-8 flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.h1
                        className="text-3xl font-bold text-gray-900"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        Categorías
                    </motion.h1>
                </motion.div>

                <motion.div layout className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    {/* Expense Categories */}
                    {expenseCategories.length > 0 && (
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <motion.h2
                                className="mb-4 text-xl font-semibold text-gray-800"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Gastos
                            </motion.h2>
                            <div className="grid gap-4">
                                <AnimatePresence mode="popLayout">
                                    {expenseCategories.map((category, index) => (
                                        <motion.div
                                            key={category.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{
                                                delay: index * 0.1,
                                                duration: 0.3,
                                            }}
                                        >
                                            <CategoryItem category={category} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.section>
                    )}

                    {/* Income Categories */}
                    {incomeCategories.length > 0 && (
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <motion.h2
                                className="mb-4 text-xl font-semibold text-gray-800"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Ingresos
                            </motion.h2>
                            <div className="grid gap-4">
                                <AnimatePresence mode="popLayout">
                                    {incomeCategories.map((category, index) => (
                                        <motion.div
                                            key={category.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{
                                                delay: index * 0.1,
                                                duration: 0.3,
                                            }}
                                        >
                                            <CategoryItem category={category} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.section>
                    )}

                    {/* Create New Category Button */}
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.2 }}>
                        <Button
                            variant="default"
                            asChild
                            className="bg-accent text-accent-foreground hover:bg-accent/80 w-full rounded-full py-6 text-lg font-bold transition-all duration-200"
                        >
                            <Link href="/categories/create" className="gap-2">
                                <PlusIcon className="h-4 w-4" />
                                Nueva categoría
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Empty State */}
                    {categories.length === 0 && (
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
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 15,
                                }}
                            >
                                📂
                            </motion.div>
                            <motion.h3
                                className="mt-4 text-lg font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                No tienes categorías
                            </motion.h3>
                            <motion.p
                                className="mt-2 text-sm text-gray-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Crea tu primera categoría para organizar tus transacciones.
                            </motion.p>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                <Button variant="default" asChild className="mt-6 rounded-full bg-blue-500 hover:bg-blue-600">
                                    <Link href="/categories/create" className="gap-2">
                                        <PlusIcon className="h-4 w-4" />
                                        Crear categoría
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}
