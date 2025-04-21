import { CategoryCard } from '@/components/onboarding/CategoryCard';
import { CreateCategorySheet } from '@/components/onboarding/CreateCategorySheet';
import { type Category, type CreateCategoryData } from '@/types';
import { motion } from 'motion/react';
import { memo, useCallback } from 'react';

interface CategoryGridProps {
    categories: Category[];
    selectedCategories: string[];
    onSelectCategory: (id: string) => void;
    onCreateCategory: (data: CreateCategoryData) => void;
}

const CreateCategoryButton = memo(({
    defaultType,
    onCreateCategory
}: {
    defaultType: "expense" | "income";
    onCreateCategory: (data: CreateCategoryData) => void;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
            delay: 0.3,
            duration: 0.3
        }}
    >
        <CreateCategorySheet
            onSubmit={onCreateCategory}
            defaultType={defaultType}
            trigger={
                <button
                    type="button"
                    className="flex h-32 w-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white transition-colors hover:border-primary/50"
                >
                    <div className="text-2xl text-gray-400">+</div>
                    <span className="mt-2 text-xs text-gray-400">Crear categoría</span>
                </button>
            }
        />
    </motion.div>
));

export function CategoryGrid({
    categories,
    selectedCategories,
    onSelectCategory,
    onCreateCategory,
}: CategoryGridProps) {
    const expenseCategories = categories.filter(category => category.type === 'expense');
    const incomeCategories = categories.filter(category => category.type === 'income');

    const handleCreateCategory = useCallback((data: CreateCategoryData) => {
        onCreateCategory(data);
    }, [onCreateCategory]);

    return (
        <div className="space-y-8">
            {/* Expense Categories Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Gastos</h2>
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                >
                    {expenseCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.05,
                                duration: 0.3
                            }}
                        >
                            <CategoryCard
                                emoji={category.emoji}
                                name={category.name}
                                isSelected={selectedCategories.includes(category.id)}
                                onClick={() => onSelectCategory(category.id)}
                            />
                        </motion.div>
                    ))}

                    <CreateCategoryButton
                        defaultType="expense"
                        onCreateCategory={handleCreateCategory}
                    />
                </motion.div>
            </div>

            {/* Income Categories Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Ingresos</h2>
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                >
                    {incomeCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.05,
                                duration: 0.3
                            }}
                        >
                            <CategoryCard
                                emoji={category.emoji}
                                name={category.name}
                                isSelected={selectedCategories.includes(category.id)}
                                onClick={() => onSelectCategory(category.id)}
                            />
                        </motion.div>
                    ))}

                    <CreateCategoryButton
                        defaultType="income"
                        onCreateCategory={handleCreateCategory}
                    />
                </motion.div>
            </div>
        </div>
    );
} 