import { motion } from "motion/react"
import { memo } from "react";

interface CategoryCardProps {
    emoji: string;
    name: string;
    isSelected?: boolean;
    onClick?: () => void;
}


export const CategoryCard = memo(function CategoryCard({
    emoji,
    name,
    isSelected = false,
    onClick
}: CategoryCardProps) {
    return (
        <motion.button
            onClick={onClick}
            className={`flex h-32 w-32 flex-col items-center justify-center rounded-2xl transition-all
                ${isSelected
                    ? 'bg-primary/10 text-black ring-2 ring-primary'
                    : 'bg-white'}`}
            whileHover={{
                scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: isSelected ? 1.05 : 1
            }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
            }}
        >
            <motion.div
                className="text-4xl"
                animate={{ scale: isSelected ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                {emoji}
            </motion.div>
            <motion.span
                className="mt-2 text-sm font-medium text-primary"
                animate={{ fontWeight: isSelected ? 600 : 500 }}
            >
                {name}
            </motion.span>
        </motion.button>
    );
}); 