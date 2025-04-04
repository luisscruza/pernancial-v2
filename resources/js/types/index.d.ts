import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Category {
    id: string;
    name: string;
    emoji: string;
    user_id: number;
}

export interface CreateCategoryData {
    name: string;
    emoji: string;
}

export interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
}


export interface BaseCurrency {
    value: string;
    label: string;
    symbol: string;
    decimalPlaces: number;
    decimalSeparator: string;
    thousandsSeparator: string;
    symbolPosition: string;
}

export interface Account {
    id: number;
    user_id: number;
    currency_id: number;
    name: string;
    type: 'savings' | 'cash' | 'investment' | 'credit_card';
    balance: number;
    description?: string;
}

export interface CreateAccountData {
    name: string;
    type: Account['type'];
    balance: number;
    currency_id: number;
    description?: string;
}
