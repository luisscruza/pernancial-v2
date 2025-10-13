import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PlusIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    EmojiPicker,
    EmojiPickerSearch,
    EmojiPickerContent,
    EmojiPickerFooter,
} from '@/components/ui/emoji-picker';

type CategoryType = 'expense' | 'income';

const DEFAULT_EMOJIS = {
    expense: '🛒',
    income: '💰'
};

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

export default function CreateCategory() {
    const [step, setStep] = useState<'type' | 'details'>('type');
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    const form = useForm({
        name: '',
        emoji: DEFAULT_EMOJIS.expense,
        type: '',
    });

    // Update emoji when type changes
    useEffect(() => {
        if (form.data.type && form.data.type in DEFAULT_EMOJIS) {
            form.setData('emoji', DEFAULT_EMOJIS[form.data.type as CategoryType]);
        }
    }, [form.data.type]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleContinue = () => {
        if (step === 'type' && form.data.type) {
            setStep('details');
        }
    };

    const handleBack = () => {
        if (step === 'details') {
            setStep('type');
        }
    };

    const canContinue = () => {
        if (step === 'type') return !!form.data.type;
        if (step === 'details') return !!form.data.name.trim() && !!form.data.emoji;
        return false;
    };

    const handleSubmit = () => {
        if (step === 'details') {
            form.post(route('categories.store'), {
                onSuccess: () => {
                    // Success will be handled by redirect
                }
            });
        }
    };

    const handleEmojiSelect = (selectedEmoji: string) => {
        form.setData('emoji', selectedEmoji);
        setIsEmojiPickerOpen(false);
    };

    const selectedCategoryType = CATEGORY_TYPES.find(t => t.value === form.data.type);

    return (
        <AppLayout title="Crear categoría">
            <Head title="Crear categoría" />
            <div className="mx-auto w-full max-w-2xl p-4">
                {/* Header */}
                <motion.div
                    className="mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/categories" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear nueva categoría</h1>
                        <p className="text-gray-600">
                            {step === 'type' && 'Selecciona el tipo de categoría'}
                            {step === 'details' && 'Añade los detalles de tu categoría'}
                        </p>
                    </div>
                </motion.div>

                {/* Progress indicator */}
                <motion.div
                    className="mb-8 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-2">
                        {['type', 'details'].map((stepName, index) => (
                            <div key={stepName} className="flex items-center">
                                <div
                                    className={`h-2 w-8 rounded-full transition-colors ${
                                        step === stepName || ['type', 'details'].indexOf(step) > index
                                            ? 'bg-primary' 
                                            : 'bg-gray-200'
                                    }`}
                                />
                                {index < 1 && <div className="h-px w-4 bg-gray-200" />}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Content */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 'type' && (
                            <motion.div
                                key="type"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <RadioGroup
                                    value={form.data.type}
                                    onValueChange={(value) => form.setData('type', value)}
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
                                                    id={categoryType.value}
                                                    className="peer absolute right-4 top-1/2 -translate-y-1/2"
                                                />
                                                <Label
                                                    htmlFor={categoryType.value}
                                                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 p-6 
                                                        hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                >
                                                    <div className="text-3xl">{categoryType.emoji}</div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">{categoryType.label}</div>
                                                        <div className="text-sm text-gray-500">{categoryType.description}</div>
                                                    </div>
                                                </Label>
                                            </div>
                                        </motion.div>
                                    ))}
                                </RadioGroup>
                            </motion.div>
                        )}

                        {step === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="type-display" className="text-lg font-medium">Tipo de categoría</Label>
                                            {selectedCategoryType && (
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1"
                                                >
                                                    <span>{selectedCategoryType.emoji}</span>
                                                    <span>{selectedCategoryType.label}</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>

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
                                                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
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

                                <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        <Label htmlFor="name" className="text-lg font-medium">Nombre de la categoría</Label>

                                        <Input
                                            id="name"
                                            placeholder={form.data.type === 'expense' ? 'Ej: Supermercado' : 'Ej: Salario'}
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            className="h-12 text-base"
                                            autoFocus
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer with navigation buttons */}
                <motion.div
                    className="mt-8 flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {step !== 'type' && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex-1"
                        >
                            Atrás
                        </Button>
                    )}
                    <Button
                        onClick={step === 'details' ? handleSubmit : handleContinue}
                        disabled={!canContinue() || form.processing}
                        className="flex-1 gap-2"
                    >
                        {form.processing ? (
                            'Creando...'
                        ) : step === 'details' ? (
                            <>
                                <PlusIcon className="h-4 w-4" />
                                Crear categoría
                            </>
                        ) : (
                            'Continuar'
                        )}
                    </Button>
                </motion.div>
            </div>
        </AppLayout>
    );
}