import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export function QuickTransactionCommand() {
    const [open, setOpen] = useState(false);
    const page = usePage<SharedData>();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const handleSelectAccount = (accountId: number) => {
        // Find the account to get its UUID
        const account = page.props.auth.user?.accounts?.find((acc) => acc.id === accountId);
        if (account) {
            router.visit(`/accounts/${account.uuid}`);
            setOpen(false);
        }
    };

    const accounts = page.props.auth.user?.accounts || [];

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Buscar cuenta para crear transacción..." />
            <CommandList>
                <CommandEmpty>No se encontraron cuentas.</CommandEmpty>
                {accounts.length > 0 && (
                    <CommandGroup heading="Crear transacción">
                        {accounts.map((account) => (
                            <CommandItem
                                key={account.id}
                                value={account.name}
                                onSelect={() => handleSelectAccount(account.id)}
                                className="flex items-center gap-3 py-3"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                    <span className="text-sm">{account.emoji}</span>
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <span className="font-medium">{account.name}</span>
                                    <span className="text-muted-foreground text-xs">{account.type_label}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Plus className="text-muted-foreground h-4 w-4" />
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}
