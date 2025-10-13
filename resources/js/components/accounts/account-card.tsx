import * as React from 'react';
import { type Account } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { EllipsisVerticalIcon } from 'lucide-react';

interface AccountCardProps {
    account: Account;
    className?: string;
}

export function AccountCard({ account, className }: AccountCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Link
                href={`/accounts/${account.uuid}`}
                className={cn(
                    "flex items-center justify-between w-full rounded-xl border-[1px] border-gray-50 bg-white p-4 shadow-sm hover:shadow-sm transition-all duration-200",
                    className
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: account.color }}>
                        <span className="text-xl">{account.emoji}</span>
                    </div>
                    <div>
                        <h3 className="text-base font-medium text-gray-900 truncate max-w-[180px]">
                            {account.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate max-w-[180px]">
                            {account.type}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-base font-semibold text-gray-900">
                            {formatCurrency(account.balance, account.currency!)}
                        </p>
                    </div>
                    <EllipsisVerticalIcon className="h-6 w-6 text-gray-400" />
                </div>
            </Link>
        </motion.div>
    );
} 