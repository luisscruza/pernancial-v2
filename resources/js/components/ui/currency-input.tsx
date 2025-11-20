import * as React from 'react';
import RCurrencyInput from 'react-currency-input-field';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
    currency: {
        symbol: string;
        decimalSeparator: string;
        thousandsSeparator: string;
        decimalPlaces: number;
    };
    value: number;
    onChange: (value: number) => void;
    allowNegative?: boolean;
    className?: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, currency, value, onChange, allowNegative = false, ...props }, ref) => {
        const handleValueChange = (value: string | undefined) => {
            // Convert the string value to a number, handling null/undefined cases
            const numericValue = value ? parseFloat(value) : 0;
            onChange(isNaN(numericValue) ? 0 : numericValue);
        };

        return (
            <RCurrencyInput
                ref={ref}
                value={value}
                onValueChange={handleValueChange}
                decimalsLimit={currency.decimalPlaces}
                decimalScale={currency.decimalPlaces}
                decimalSeparator={currency.decimalSeparator}
                groupSeparator={currency.thousandsSeparator}
                allowNegativeValue={allowNegative}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className
                )}
                {...props}
            />
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput }; 