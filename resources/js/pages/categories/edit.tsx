import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    EmojiPicker,
    EmojiPickerSearch,
    EmojiPickerContent,
    EmojiPickerFooter,
} from '@/components/ui/emoji-picker';
import { Category } from '@/types';

const CATEGORY_TYPES = [
    {
        value: 'expense',
        label: 'Gasto',
        emoji: '💸',
        description: 'Para categorizar tus gastos y egresos'
    },
    {
        value: 'income',
        label: 'Ingreso',
        emoji: '💰',
        description: 'Para categorizar tus ingresos y entradas'
    }
];

interface Props {
    category: Category;
}

export default function EditCategory({ category }: Props) {
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    const form = useForm({
        name: category.name,
        emoji: category.emoji,
        type: category.type,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('categories.update', category.id), {
            onSuccess: () => {
                // Success will be handled by redirect
            }
        });
    };

    const handleEmojiSelect = (selectedEmoji: string) => {
        form.setData('emoji', selectedEmoji);
        setIsEmojiPickerOpen(false);
    };

    return (
        <AppLayout title={`Editar ${category.name}`}>
            <Head title={`Editar ${category.name}`} />
            <div className="mx-auto w-full max-w-2xl p-4">
                {/* Header */}
                <motion.div
                    className="mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('categories.show', category.id)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar categoría</h1>
                        <p className="text-gray-600">Actualiza los detalles de tu categoría</p>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Category Type */}
                        <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                            <div className="space-y-4">
                                <Label className="text-lg font-medium">Tipo de categoría</Label>
                                
                                <RadioGroup
                                    value={form.data.type}
                                    onValueChange={(value) => form.setData('type', value as 'expense' | 'income')}
                                    className="grid grid-cols-1 gap-4"
                                >
                                    {CATEGORY_TYPES.map((categoryType) => (
                                        <motion.div
                                            key={categoryType.value}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="relative">
                                                <RadioGroupItem
                                                    value={categoryType.value}
                                                    id={`edit-${categoryType.value}`}
                                                    className="peer absolute right-4 top-1/2 -translate-y-1/2"
                                                />
                                                <Label
                                                    htmlFor={`edit-${categoryType.value}`}
                                                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 p-4 
                                                        hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                >
                                                    <div className="text-2xl">{categoryType.emoji}</div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">{categoryType.label}</div>
                                                        <div className="text-sm text-gray-500">{categoryType.description}</div>
                                                    </div>
                                                </Label>
                                            </div>
                                        </motion.div>
                                    ))}
                                </RadioGroup>
                                {form.errors.type && (
                                    <p className="text-sm text-red-600">{form.errors.type}</p>
                                )}
                            </div>
                        </div>

                        {/* Emoji */}
                        <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                            <div className="space-y-4">
                                <Label htmlFor="emoji" className="text-lg font-medium">Emoji</Label>
                                
                                <div className="flex items-center justify-center relative">
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
                                            {form.data.emoji}
                                        </Button>
                                    </motion.div>

                                    <AnimatePresence>
                                        {isEmojiPickerOpen && (
                                            <motion.div
                                                className="absolute z-50 top-full mt-2"
                                                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                                transition={{ duration: 0.2 }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
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
                                
                                {form.errors.emoji && (
                                    <p className="text-sm text-red-600">{form.errors.emoji}</p>
                                )}
                                
                                <motion.p
                                    className="text-sm text-gray-500 text-center"
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Elige un emoji que represente tu categoría
                                </motion.p>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                            <div className="space-y-4">
                                <Label htmlFor="name" className="text-lg font-medium">Nombre de la categoría</Label>

                                <Input
                                    id="name"
                                    placeholder={form.data.type === 'expense' ? 'Ej: Supermercado' : 'Ej: Salario'}
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="h-12 text-base"
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-red-600">{form.errors.name}</p>
                                )}

                                <motion.p
                                    className="text-sm text-gray-500"
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Un nombre descriptivo te ayudará a organizar mejor tus transacciones.
                                </motion.p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.div
                            className="flex gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Button
                                variant="outline"
                                type="button"
                                className="flex-1"
                                asChild
                            >
                                <Link href={route('categories.show', category.id)}>Cancelar</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={!form.data.name.trim() || !form.data.emoji || form.processing}
                                className="flex-1 gap-2"
                            >
                                {form.processing ? (
                                    'Guardando...'
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Guardar cambios
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </AppLayout>
    );
}