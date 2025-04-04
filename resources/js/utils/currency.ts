import { Currency, type BaseCurrency } from '@/types';

/**
 * Format a number into a currency string using custom currency settings.
 */
export function formatCurrency(
    amount: number | string | null | undefined,
    currency: BaseCurrency | Currency,
): string {
    if (amount == null || amount === '') return '';

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const [intPart, decimalPart] = numericAmount
        .toFixed(currency.decimal_places)
        .split('.');

    const withThousands = intPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        currency.thousands_separator
    );

    const result = `${withThousands}${currency.decimal_places > 0 ? currency.decimal_separator + decimalPart : ''}`;

    return currency.symbol_position === 'before' || currency.symbol_position === 'prefix'
        ? `${currency.symbol}${result}`
        : `${result}${currency.symbol}`;
}

/**
 * Parse a formatted currency input string back into a number.
 */
export function parseCurrencyInput(
    value: string,
    currency: BaseCurrency,
): number | null {
    if (!value) return null;

    const cleaned = value
        .replace(new RegExp(`\\${currency.symbol}`, 'g'), '')
        .trim()
        .replace(new RegExp(`\\${currency.thousands_separator}`, 'g'), '')
        .replace(currency.decimal_separator, '.');

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Format a currency input value while typing.
 * Used in input fields to show grouping as the user types.
 */
export function formatCurrencyInput(
    value: string | number | null | undefined,
    currency: BaseCurrency,
): string {
    if (value == null || value === '') return '';

    const numericValue = typeof value === 'string'
        ? parseCurrencyInput(value, currency)
        : value;

    if (numericValue === null) return '';

    const [intPart, decimalPart] = numericValue
        .toFixed(currency.decimal_places)
        .split('.');

    const withThousands = intPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        currency.thousands_separator
    );

    return `${withThousands}${currency.decimal_places > 0 ? currency.decimal_separator + decimalPart : ''}`;
}
