import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Group an array of items by a key selector function.
 */
export function groupBy<T, K extends string | number | symbol>(
    array: T[],
    keySelector: (item: T) => K
): Record<K, T[]> {
    return array.reduce((acc, item) => {
        const key = keySelector(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<K, T[]>);
}
