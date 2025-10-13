export function categoryLabel(type: 'expense' | 'income'): string {
    return type === 'expense' ? 'Gasto' : 'Ingreso';
}