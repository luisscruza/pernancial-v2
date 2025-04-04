import OnboardingLayout from '@/layouts/onboarding-layout';
import { type BaseCurrency, type CreateAccountData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountForm } from '@/components/onboarding/AccountForm';
import { useState } from 'react';

interface Props {
    currencies: BaseCurrency[];
}

export default function Onboarding({ currencies }: Props) {
    const [step, setStep] = useState<'type' | 'balance' | 'name'>('type');

    // Inicializar el formulario con useForm de Inertia
    const form = useForm<Partial<CreateAccountData>>({
        type: undefined,
        name: 'Mi cuenta',
        description: '',
        balance: 0,
        currency_id: currencies.length > 0 ? currencies[0].value : undefined
    });

    const handleContinue = () => {
        if (step === 'type' && form.data.type) {
            setStep('balance');
        } else if (step === 'balance' && form.data.currency_id && form.data.balance !== undefined) {
            setStep('name');
        }
    };

    const handleBack = () => {
        if (step === 'name') {
            setStep('balance');
        } else if (step === 'balance') {
            setStep('type');
        }
    };

    const handleFormChange = (data: Partial<CreateAccountData>) => {
        form.setData({
            ...form.data,
            ...data
        });
    };

    const canContinue = () => {
        if (step === 'type') return !!form.data.type;
        if (step === 'balance') {
            return form.data.currency_id !== undefined && form.data.balance !== undefined;
        }
        if (step === 'name') return !!form.data.name;
        return false;
    };

    const handleSubmit = () => {
        if (step === 'name' && form.data.name) {
            // Enviar el formulario a través de Inertia
            form.post(route('onboarding.accounts.store'), {
                onSuccess: () => {
                    // Manejar éxito
                    console.log('Account created successfully');
                }
            });
        }
    };

    return (
        <OnboardingLayout>
            <Head title="Onboarding" />
            <div className="flex flex-col h-full">
                {/* Fixed header */}
                <div className="sticky top-0 bg-transparent z-0 mb-4 pt-4 pb-4">
                    <div className="mx-auto w-full md:w-lg max-w-lg space-y-2 p-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="account"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h1 className="text-2xl font-bold">Crea tu primera cuenta</h1>
                                <p className="text-gray-400">
                                    Configura una cuenta para comenzar a registrar tus gastos
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="mx-auto w-full md:w-lg max-w-lg">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="account"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <AccountForm
                                    currencies={currencies}
                                    step={step}
                                    onChange={handleFormChange}
                                    formData={form.data}
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
                                className="w-full flex gap-3"
                            >
                                {step !== 'type' && (
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleBack}
                                    >
                                        Atrás
                                    </Button>
                                )}
                                <Button
                                    className="flex-1"
                                    onClick={step === 'name' ? handleSubmit : handleContinue}
                                    disabled={!canContinue()}
                                >
                                    {step === 'name' ? 'Crear cuenta' : 'Continuar'}
                                </Button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
}
