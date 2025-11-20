import type { Account } from '@/types/index';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

import EmojiPicker from '@/components/emoji-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';

interface AccountTypeOption {
    value: string;
    label: string;
    emoji: string;
    description: string;
}

interface Props {
    account: Account;
    accountTypes: AccountTypeOption[];
}

export default function EditAccount({ account, accountTypes }: Props) {
    console.log(account);
    const [showBalanceAdjustment, setShowBalanceAdjustment] = useState(false);

    const form = useForm({
        name: account.name,
        type: account.type,
        emoji: account.emoji,
        color: account.color,
        is_active: account.is_active ?? true,
        balance_adjustment: null as number | null,
    });

    const selectedAccountType = accountTypes.find((t) => t.value === form.data.type);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Only include balance_adjustment if the toggle is on
        if (!showBalanceAdjustment) {
            form.setData('balance_adjustment', null);
        }

        form.put(route('accounts.update', account.uuid), {
            onSuccess: () => {
                // Will redirect automatically
            },
        });
    };

    return (
        <AppLayout title={`Editar ${account.name}`}>
            <Head title={`Editar ${account.name}`} />

            <div className="mx-auto w-full max-w-2xl p-4">
                {/* Header */}
                <motion.div
                    className="mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('accounts.show', account.uuid)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar cuenta</h1>
                        <p className="text-gray-600">Modifica los detalles de tu cuenta</p>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Account Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Información básica</CardTitle>
                                <CardDescription>Actualiza el nombre y tipo de cuenta</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Account Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre de la cuenta</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="ej., Cuenta principal"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className={form.errors.name ? 'border-destructive' : ''}
                                    />
                                    {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
                                </div>

                                {/* Account Type */}
                                <div className="space-y-2">
                                    <Label>Tipo de cuenta</Label>
                                    <RadioGroup
                                        value={form.data.type}
                                        onValueChange={(value) => form.setData('type', value as Account['type'])}
                                        className="grid grid-cols-1 gap-3"
                                    >
                                        {accountTypes.map((accountType) => (
                                            <div key={accountType.value}>
                                                <RadioGroupItem value={accountType.value} id={accountType.value} className="peer sr-only" />
                                                <Label
                                                    htmlFor={accountType.value}
                                                    className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 flex cursor-pointer items-center gap-4 rounded-lg border-2 border-gray-200 p-4 transition-all hover:bg-gray-50"
                                                >
                                                    <span className="text-2xl">{accountType.emoji}</span>
                                                    <div className="flex-1">
                                                        <div className="font-semibold">{accountType.label}</div>
                                                        <div className="text-xs text-gray-500">{accountType.description}</div>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    {form.errors.type && <p className="text-destructive text-sm">{form.errors.type}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Appearance */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Apariencia</CardTitle>
                                <CardDescription>Personaliza el emoji y color de tu cuenta</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Emoji Picker */}
                                <div className="space-y-2">
                                    <Label htmlFor="emoji">Emoji</Label>
                                    <EmojiPicker value={form.data.emoji} onChange={(emoji: string) => form.setData('emoji', emoji)} />
                                    {form.errors.emoji && <p className="text-destructive text-sm">{form.errors.emoji}</p>}
                                </div>

                                {/* Color Picker */}
                                <div className="space-y-2">
                                    <Label htmlFor="color">Color</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="color"
                                            type="color"
                                            value={form.data.color}
                                            onChange={(e) => form.setData('color', e.target.value)}
                                            className="h-10 w-20 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={form.data.color}
                                            onChange={(e) => form.setData('color', e.target.value)}
                                            placeholder="#000000"
                                            className="flex-1"
                                        />
                                    </div>
                                    {form.errors.color && <p className="text-destructive text-sm">{form.errors.color}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Account Status */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Estado de la cuenta</CardTitle>
                                <CardDescription>Controla si esta cuenta está activa o inactiva</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">Cuenta activa</Label>
                                        <p className="text-muted-foreground text-sm">Las cuentas inactivas no aparecerán en la lista principal</p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={form.data.is_active}
                                        onCheckedChange={(checked: boolean) => form.setData('is_active', checked)}
                                    />
                                </div>
                                {form.errors.is_active && <p className="text-destructive mt-2 text-sm">{form.errors.is_active}</p>}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Balance Adjustment */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Ajuste de balance</CardTitle>
                                <CardDescription>Ajusta el balance de la cuenta si es necesario</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-muted flex items-center justify-between rounded-lg p-4">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Balance actual</p>
                                        <p className="text-2xl font-bold">
                                            {account.currency.symbol}
                                            {account.balance.toFixed(account.currency.decimal_places)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch id="show_adjustment" checked={showBalanceAdjustment} onCheckedChange={setShowBalanceAdjustment} />
                                    <Label htmlFor="show_adjustment">Realizar ajuste de balance</Label>
                                </div>

                                {showBalanceAdjustment && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="balance_adjustment">Nuevo balance</Label>
                                        <div className="relative">
                                            <motion.div
                                                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 font-medium"
                                                initial={{ x: -5, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                            >
                                                {account.currency.symbol}
                                            </motion.div>
                                            <CurrencyInput
                                                currency={{
                                                    symbol: account.currency.symbol,
                                                    decimalSeparator: account.currency.decimal_separator,
                                                    thousandsSeparator: account.currency.thousands_separator,
                                                    decimalPlaces: account.currency.decimal_places,
                                                }}
                                                value={form.data.balance_adjustment ?? account.balance}
                                                onChange={(value) => form.setData('balance_adjustment', value)}
                                                className="h-10 pl-8"
                                                allowNegative={true}
                                            />
                                        </div>
                                        {form.data.balance_adjustment !== null && form.data.balance_adjustment !== account.balance && (
                                            <p className="text-muted-foreground text-sm">
                                                Se creará una transacción de ajuste por{' '}
                                                <span
                                                    className={
                                                        form.data.balance_adjustment > account.balance
                                                            ? 'font-semibold text-green-600'
                                                            : 'font-semibold text-red-600'
                                                    }
                                                >
                                                    {account.currency.symbol}
                                                    {Math.abs(form.data.balance_adjustment - account.balance).toFixed(
                                                        account.currency.decimal_places,
                                                    )}
                                                </span>
                                            </p>
                                        )}
                                        {form.errors.balance_adjustment && (
                                            <p className="text-destructive text-sm">{form.errors.balance_adjustment}</p>
                                        )}
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Footer with action buttons */}
                    <motion.div className="flex gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <Button type="button" variant="outline" onClick={() => window.history.back()} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={form.processing || !form.data.name.trim()} className="flex-1 gap-2">
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
            </div>
        </AppLayout>
    );
}
