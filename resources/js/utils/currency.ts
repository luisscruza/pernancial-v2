import { type BaseCurrency } from '@/types';

export function formatCurrency(
    amount: number | string | null | undefined,
    currency: BaseCurrency,
): string {
    if (amount === null || amount === undefined || amount === '') {
        return '';
    }

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    const formatter = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces,
        useGrouping: true,
    });

    const formattedNumber = formatter.format(numericAmount)
        .replace('.', currency.decimalSeparator)
        .replace(/,/g, currency.thousandsSeparator);

    return currency.symbolPosition === 'before'
        ? `${currency.symbol}${formattedNumber}`
        : `${formattedNumber}${currency.symbol}`;
}

export function parseCurrencyInput(
    value: string,
    currency: BaseCurrency,
): number | null {
    if (!value) return null;

    // Remove currency symbol and any whitespace
    const cleanValue = value
        .replace(currency.symbol, '')
        .replace(/\s/g, '')
        // Replace the currency's decimal separator with a standard period
        .replace(currency.decimalSeparator, '.')
        // Remove the thousands separator
        .replace(new RegExp(`\\${currency.thousandsSeparator}`, 'g'), '');

    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
}

export function formatCurrencyInput(
    value: string | number | null | undefined,
    currency: BaseCurrency,
): string {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    const numericValue = typeof value === 'string' ? parseCurrencyInput(value, currency) : value;
    if (numericValue === null) return '';

    const parts = numericValue.toFixed(currency.decimalPlaces).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
    const decimalPart = parts[1];

    return `${integerPart}${currency.decimalSeparator}${decimalPart}`;
} 