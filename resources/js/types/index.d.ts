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
    flash?: {
        success?: string;
        error?: string;
        message?: string;
    };
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
    currency: Currency;
    accounts?: Array<{
        id: number;
        label: string;
        uuid: string;
        name: string;
        emoji: string;
        type: string;
    }>;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Category {
    id: string;
    uuid?: string;
    name: string;
    emoji: string;
    user_id: number;
}

export interface CreateCategoryData {
    name: string;
    type: 'expense' | 'income';
    emoji: string;
}

export interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    decimal_places: number;
    decimal_separator: string;
    thousands_separator: string;
    symbol_position: string;
    is_base: boolean;
}

export interface BaseCurrency {
    value: string;
    label: string;
    symbol: string;
    decimal_places: number;
    decimal_separator: string;
    thousands_separator: string;
    symbol_position: string;
}

export interface Account {
    id: number;
    uuid: string;
    user_id?: number;
    currency_id?: number;
    name: string;
    type: 'savings' | 'cash' | 'investment' | 'credit_card' | 'bank' | 'checking' | 'general' | 'debit_card' | 'cxc' | 'cxp';
    type_label?: string;
    accounting_type: 'normal' | 'cxc' | 'cxp';
    emoji: string;
    color: string;
    balance: number;
    balance_in_base: number;
    is_active: boolean;
    description?: string;
    currency: Currency;
    transactions?: Transaction[];
}

export interface TransactionSplit {
    id: number;
    transaction_id?: number;
    category_id: number;
    amount: number;
    category?: Category;
}

export interface Transaction {
    id: number;
    account_id: number;
    amount: number;
    personal_amount?: number | null;
    description?: string;
    category_id?: string;
    created_at: string;
    updated_at: string;
    transaction_date: string;
    running_balance?: number;
    converted_amount?: number;
    ai_assisted: boolean;
    category?: Category;
    splits?: TransactionSplit[];
    receivables?: Receivable[];
    account: Account;
    type: 'expense' | 'income' | 'transfer_in' | 'transfer_out' | 'initial';
    from_account: Account | null;
    destination_account: Account | null;
}

export interface Contact {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface ReceivableSeries {
    id: number;
    contact_id: number;
    currency_id: number;
    name: string;
    default_amount: number;
    is_recurring: boolean;
    recurrence_rule?: Record<string, unknown> | null;
    next_due_date?: string | null;
}

export interface PayableSeries {
    id: number;
    contact_id: number;
    currency_id: number;
    name: string;
    default_amount: number;
    is_recurring: boolean;
    recurrence_rule?: Record<string, unknown> | null;
    next_due_date?: string | null;
}

export interface ReceivablePayment {
    id: number;
    receivable_id: number;
    account_id: number;
    transaction_id?: number | null;
    amount: number;
    paid_at: string;
    note?: string | null;
    account?: Account;
    transaction?: Transaction | null;
}

export interface PayablePayment {
    id: number;
    payable_id: number;
    account_id: number;
    transaction_id?: number | null;
    amount: number;
    paid_at: string;
    note?: string | null;
    account?: Account;
    transaction?: Transaction | null;
}

export interface Receivable {
    id: number;
    contact_id: number;
    currency_id: number;
    receivable_series_id?: number | null;
    amount_total: number;
    amount_paid: number;
    status: 'open' | 'partial' | 'paid';
    description?: string | null;
    due_date: string;
    origin_transaction_id?: number | null;
    contact?: Contact;
    currency?: Currency;
    payments?: ReceivablePayment[];
}

export interface Payable {
    id: number;
    contact_id: number;
    currency_id: number;
    payable_series_id?: number | null;
    amount_total: number;
    amount_paid: number;
    status: 'open' | 'partial' | 'paid';
    description?: string | null;
    due_date: string;
    origin_transaction_id?: number | null;
    contact?: Contact;
    currency?: Currency;
    payments?: PayablePayment[];
}

export interface Category {
    id: string;
    name: string;
    emoji: string;
    type: 'expense' | 'income';
    user_id: number;
}

export interface BudgetPeriod {
    id: number;
    name: string;
    type: 'monthly' | 'weekly' | 'yearly' | 'custom';
    start_date: string;
    end_date: string;
    user_id: number;
    budgets?: Budget[];
    total_spent?: number;
    total_expense_spent?: number;
    total_income_received?: number;
}

export interface Budget {
    id: number;
    user_id: number;
    budget_period_id: number;
    name: string;
    amount: number;
    type: 'period' | 'one_time';
    category_id: string;
    start_date: string;
    end_date: string;
    description?: string;
    category: Category;
    budgetPeriod: BudgetPeriod;
    budget_period: BudgetPeriod;
}

export interface BudgetSummary {
    budget: Budget;
    total_spent: number;
    remaining: number;
    percentage_used: number;
    is_over_budget: boolean;
    date_range: {
        start: string;
        end: string;
    };
    transaction_count: number;
}

export interface CreateBudgetData {
    user_id: number;
    name: string;
    amount: number;
    type: 'period' | 'one_time';
    period_type: 'monthly' | 'weekly' | 'yearly' | 'custom';
    category_id: string;
    start_date: string;
    end_date: string;
    description?: string;
}

export interface CreateAccountData {
    name: string;
    type: Account['type'];
    balance: number;
    currency_id: number;
    description?: string;
}

export interface PaginatedProps<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    };
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
