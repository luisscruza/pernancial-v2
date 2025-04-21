import OnboardingLayout from '@/layouts/onboarding-layout';
import { type Category, type CreateCategoryData } from '@/types';
import { Head } from '@inertiajs/react';
import { CategoryGrid } from '@/components/onboarding/CategoryGrid';
import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from "@inertiajs/react";
import { store } from '@/actions/App/Http/Controllers/OnboardingCategoryController';

type CategoryType = 'expense' | 'income';

const DEFAULT_CATEGORIES: Omit<Category, 'user_id'>[] = [
    // Expense categories
    { id: 'groceries', name: 'Compras', emoji: '🥑', type: 'expense' },
    { id: 'clothing', name: 'Ropa', emoji: '👖', type: 'expense' },
    { id: 'dining', name: 'Comer afuera', emoji: '🍔', type: 'expense' },
    { id: 'luxury', name: 'Lujo', emoji: '💎', type: 'expense' },
    { id: 'auto', name: 'Auto', emoji: '🚗', type: 'expense' },
    { id: 'pets', name: 'Mascotas', emoji: '🐶', type: 'expense' },

    // Income categories
    { id: 'salary', name: 'Salario', emoji: '💰', type: 'income' },
    { id: 'investments', name: 'Inversiones', emoji: '📈', type: 'income' },
    { id: 'gifts', name: 'Regalos', emoji: '🎁', type: 'income' },
];

export default function Onboarding() {
    const [customCategories, setCustomCategories] = useState<Omit<Category, 'user_id'>[]>([]);

    const form = useForm({
        categories: [] as Array<{ id: string, name: string, emoji: string, type: CategoryType }>,
    });

    // Memoize all categories to prevent recalculation on each render
    const allCategories = useMemo(() =>
        [...DEFAULT_CATEGORIES, ...customCategories],
        [customCategories]
    );

    const handleSelectCategory = useCallback((id: string) => {
        const category = allCategories.find(cat => cat.id === id);

        if (!category) return;

        const isSelected = form.data.categories.some(cat => cat.id === id);

        form.setData('categories',
            isSelected
                ? form.data.categories.filter(cat => cat.id !== id)
                : [...form.data.categories, {
                    id: category.id,
                    name: category.name,
                    emoji: category.emoji,
                    type: category.type
                }]
        );
    }, [allCategories, form]);

    const handleCreateCategory = useCallback((data: CreateCategoryData) => {
        const newCategory = {
            id: `custom-${Date.now()}`,
            ...data,
        };
        setCustomCategories((prev) => [...prev, newCategory]);

        form.setData('categories', [
            ...form.data.categories,
            {
                id: newCategory.id,
                name: newCategory.name,
                emoji: newCategory.emoji,
                type: newCategory.type
            }
        ]);
    }, [form]);

    const handleContinue = useCallback(() => {
        form.post(store().url, {
            preserveScroll: true,
        });
    }, [form]);

    return (
        <OnboardingLayout>
            <Head title="Onboarding" />
            <div className="flex flex-col h-full">
                {/* Fixed header */}
                <div className="sticky top-0 bg-transparent z-0 mb-4 pt-4 pb-4">
                    <div className="mx-auto max-w-2xl space-y-2 px-4 pt-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="categories"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h1 className="text-2xl font-bold">Elige tus categorías</h1>
                                <p className="text-gray-400">
                                    Selecciona las categorías que usarás para organizar tus gastos e ingresos
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="mx-auto max-w-2xl pb-24">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="categories"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <CategoryGrid
                                    categories={allCategories as Category[]}
                                    selectedCategories={form.data.categories.map(cat => cat.id)}
                                    onSelectCategory={handleSelectCategory}
                                    onCreateCategory={handleCreateCategory}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>


                {/* Fixed footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 z-0">
                    <div className="mx-auto max-w-lg">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="continue-button"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full"
                            >
                                <Button
                                    className="w-full"
                                    onClick={handleContinue}
                                    disabled={form.processing}
                                >
                                    {form.processing ? 'Guardando...' : 'Continuar'}
                                </Button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
}
