
/**
 * Formatea un número para que tenga punto mil.
 * @param value El número a formatear.
 * @param decimals Cantidad de decimales a mostrar (por defecto 0).
 * @returns Cadena con separadores de miles y coma decimal.
 */
export function formatNumberCO(value: number, decimals = 0): string {
    const fixed = value.toFixed(decimals);                 // 1. Redondea
    const [entera, decimal] = fixed.split('.');           // 2. Separa partes
    const parteEntera = entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // 3. Puntos de miles
    return decimals > 0
        ? `${parteEntera},${decimal}`                       // 4. Si hay decimales
        : parteEntera;
}
