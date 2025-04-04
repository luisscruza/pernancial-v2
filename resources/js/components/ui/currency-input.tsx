import * as React from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/currency';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    currency: {
        symbol: string;
        decimalSeparator: string;
        thousandsSeparator: string;
        decimalPlaces: number;
    };
    value: number;
    onChange: (value: number) => void;
    allowNegative?: boolean;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, currency, value, onChange, allowNegative = false, ...props }, ref) => {
        const [displayValue, setDisplayValue] = React.useState(() =>
            formatCurrencyInput(value, currency)
        );
        const [isFocused, setIsFocused] = React.useState(false);

        // Update display value when controlled value changes
        React.useEffect(() => {
            if (!isFocused) {
                setDisplayValue(formatCurrencyInput(value, currency));
            }
        }, [value, currency, isFocused]);

        const formatTypingValue = (value: string): string => {
            // Allow negative sign at the beginning
            const isNegative = allowNegative && value.startsWith('-');

            // Remove any non-numeric characters except decimal separator and negative sign
            let cleanValue = value
                .replace(new RegExp(`[^0-9${currency.decimalSeparator}${allowNegative ? '-' : ''}]`, 'g'), '')
                // Ensure only one decimal separator
                .replace(new RegExp(`\\${currency.decimalSeparator}`, 'g'),
                    (match, offset, string) =>
                        string.indexOf(currency.decimalSeparator) === offset ? match : '');

            // Ensure negative sign is only at the beginning
            if (allowNegative) {
                cleanValue = cleanValue.replace(/-/g, (match, offset) => offset === 0 ? match : '');
            }

            // Split into integer and decimal parts
            const parts = cleanValue.split(currency.decimalSeparator);

            // Format integer part with thousands separator
            if (parts[0]) {
                // Don't apply thousands separator to the negative sign
                const integerPart = parts[0].replace(/^-/, '');
                const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
                parts[0] = isNegative ? `-${formattedInteger}` : formattedInteger;
            }

            // Limit decimal places during typing
            if (parts[1]) {
                parts[1] = parts[1].slice(0, currency.decimalPlaces);
            }

            return parts.join(currency.decimalSeparator);
        };

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = formatTypingValue(event.target.value);
            setDisplayValue(newValue);

            // Only call onChange with the parsed value
            const parsedValue = parseCurrencyInput(newValue, currency);
            onChange(parsedValue);
        };

        const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            props.onFocus?.(event);
        };

        const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            // Reformat the display value on blur with fixed decimal places
            setDisplayValue(formatCurrencyInput(value, currency));
            props.onBlur?.(event);
        };

        return (
            <div className="relative">
                <Input
                    {...props}
                    ref={ref}
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={cn("pr-8", className)}
                    type="text"
                    inputMode="decimal"
                />

            </div>
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput }; 