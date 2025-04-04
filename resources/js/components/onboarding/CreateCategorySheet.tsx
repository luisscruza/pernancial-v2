import { Sheet } from "@silk-hq/components";
import { useState } from "react";
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
}

function CategoryForm({ onSubmit, onDismiss }: { onSubmit: (data: CreateCategoryData) => void; onDismiss: () => void }) {
    const [name, setName] = useState("");
    const [emoji, setEmoji] = useState("😀");
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, emoji });
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
        <div className="px-4 pb-8 pt-4">
            <motion.div
                className="mb-6 space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Sheet.Title className="text-xl font-bold">Nueva categoría</Sheet.Title>
                <Sheet.Description className="text-sm text-gray-500">
                    Crea una nueva categoría para organizar tus gastos
                </Sheet.Description>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
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
                                        onClick={handleEmojiPickerClick}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <EmojiPicker
                                            className="h-[342px]"
                                            onEmojiSelect={({ emoji }) => handleEmojiSelect(emoji)}
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
                            placeholder="Ej: Supermercado"
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

export function CreateCategorySheet({ onSubmit, trigger }: CreateCategorySheetProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet.Root license="non-commercial">
            <Sheet.Trigger asChild>
                <motion.div
                    onClick={() => setIsOpen(true)}
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
                                <Sheet.Backdrop themeColorDimming="auto" onClick={() => setIsOpen(false)} />
                            </motion.div>
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            >
                                <Sheet.Content className="BottomSheet-content">
                                    <Sheet.BleedingBackground className="BottomSheet-bleedingBackground" />
                                    <CategoryForm
                                        onSubmit={(data) => {
                                            onSubmit(data);
                                            setIsOpen(false);
                                        }}
                                        onDismiss={() => setIsOpen(false)}
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