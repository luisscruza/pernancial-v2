import { CategoryCard } from '@/components/onboarding/CategoryCard';
import { CreateCategorySheet } from '@/components/onboarding/CreateCategorySheet';
import { type Category, type CreateCategoryData } from '@/types';
import { motion } from 'motion/react';

interface CategoryGridProps {
    categories: Category[];
    selectedCategories: string[];
    onSelectCategory: (id: string) => void;
    onCreateCategory: (data: CreateCategoryData) => void;
}

export function CategoryGrid({
    categories,
    selectedCategories,
    onSelectCategory,
    onCreateCategory,
}: CategoryGridProps) {
    return (
        <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
        >
            {categories.map((category, index) => (
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

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: categories.length * 0.05,
                    duration: 0.3
                }}
            >
                <CreateCategorySheet
                    onSubmit={onCreateCategory}
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
        </motion.div>
    );
} 