import { Sheet } from "@silk-hq/components";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { type CreateCategoryData } from "@/types";
import {
    EmojiPicker,
    EmojiPickerSearch,
    EmojiPickerContent,
    EmojiPickerFooter,
} from "@/components/ui/emoji-picker";
import { motion, AnimatePresence } from "motion/react";
import "./BottomSheet.css";

interface CreateCategorySheetProps {
    onSubmit: (data: CreateCategoryData) => void;
    trigger?: React.ReactNode;
    defaultType?: "expense" | "income";
}

type CategoryType = "expense" | "income";

const DEFAULT_EMOJIS = {
    expense: "🛒",
    income: "💰"
};

function CategoryForm({ onSubmit, onDismiss, defaultType = "expense" }: {
    onSubmit: (data: CreateCategoryData) => void;
    onDismiss: () => void;
    defaultType?: CategoryType;
}) {
    const [name, setName] = useState("");
    const [emoji, setEmoji] = useState(DEFAULT_EMOJIS[defaultType]);
    const [type, setType] = useState<CategoryType>(defaultType);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    // Update emoji when type changes
    useEffect(() => {
        setEmoji(DEFAULT_EMOJIS[type]);
    }, [type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, emoji, type });
        onDismiss();
    };

    const handleEmojiSelect = (selectedEmoji: string) => {
        setEmoji(selectedEmoji);
        setIsEmojiPickerOpen(false);
    };

    const handleEmojiPickerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="px-4 pb-8 pt-4" onClick={(e) => e.stopPropagation()}>
            <motion.div
                className="mb-6 space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Sheet.Title className="text-xl font-bold">Nueva categoría</Sheet.Title>
                <Sheet.Description className="text-sm text-gray-500">
                    Crea una nueva categoría para organizar tus finanzas
                </Sheet.Description>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                    >
                        <label className="mb-2 block text-sm font-medium">
                            Tipo
                        </label>
                        <div className="flex rounded-lg overflow-hidden border border-gray-300">
                            <button
                                type="button"
                                className={`flex-1 py-2.5 px-4 text-center transition ${type === "expense"
                                    ? "bg-primary text-white font-medium"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                    }`}
                                onClick={() => setType("expense")}
                            >
                                Gasto
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2.5 px-4 text-center transition ${type === "income"
                                    ? "bg-primary text-white font-medium"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                    }`}
                                onClick={() => setType("income")}
                            >
                                Ingreso
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <label htmlFor="emoji" className="mb-2 block text-sm font-medium">
                            Emoji
                        </label>
                        <div className="flex items-center justify-center">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="outline"
                                    className="text-5xl h-24 w-24 rounded-full p-0"
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsEmojiPickerOpen(!isEmojiPickerOpen);
                                    }}
                                >
                                    {emoji}
                                </Button>
                            </motion.div>

                            <AnimatePresence>
                                {isEmojiPickerOpen && (
                                    <motion.div
                                        className="absolute z-50 bottom-0 p-5 mt-1"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <EmojiPicker
                                            className="h-[342px]"
                                            onEmojiSelect={({ emoji }) => {
                                                setTimeout(() => {
                                                    handleEmojiSelect(emoji);
                                                }, 0);
                                            }}
                                        >
                                            <EmojiPickerSearch />
                                            <EmojiPickerContent />
                                            <EmojiPickerFooter />
                                        </EmojiPicker>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <label htmlFor="name" className="mb-2 block text-sm font-medium">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder={type === "expense" ? "Ej: Supermercado" : "Ej: Salario"}
                            required
                        />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button type="submit" className="w-full" disabled={!name || !emoji}>
                        Crear categoría
                    </Button>
                </motion.div>
            </form>
        </div>
    );
}

export function CreateCategorySheet({ onSubmit, trigger, defaultType = "expense" }: CreateCategorySheetProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet.Root license="non-commercial">
            <Sheet.Trigger asChild>
                <motion.div
                    onClick={() => {
                        setIsOpen(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {trigger}
                </motion.div>
            </Sheet.Trigger>
            <AnimatePresence>
                {isOpen && (
                    <Sheet.Portal>
                        <Sheet.View nativeEdgeSwipePrevention={true} className="BottomSheet-view">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Sheet.Backdrop themeColorDimming="auto" onClick={() => {
                                    setIsOpen(false);
                                }} />
                            </motion.div>
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            >
                                <Sheet.Content
                                    className="BottomSheet-content"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <Sheet.BleedingBackground className="BottomSheet-bleedingBackground" />
                                    <CategoryForm
                                        defaultType={defaultType}
                                        onSubmit={(data) => {
                                            onSubmit(data);
                                            setIsOpen(false);
                                        }}
                                        onDismiss={() => {
                                            setIsOpen(false);
                                        }}
                                    />
                                </Sheet.Content>
                            </motion.div>
                        </Sheet.View>
                    </Sheet.Portal>
                )}
            </AnimatePresence>
        </Sheet.Root>
    );
} 