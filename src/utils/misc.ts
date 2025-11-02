export function formatPercent(val: number, digits = 2) {
    return new Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: digits }).format(val);
}