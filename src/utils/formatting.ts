// ============================================
// UTILS - Formateo y cálculos precisos
// ============================================

/**
 * Formatea un número como moneda mexicana (MXN)
 * @param amount - Cantidad a formatear
 * @returns String formateado como "$XX.XX"
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Formatea un número como moneda simple (sin símbolo completo)
 * @param amount - Cantidad a formatear
 * @returns String formateado como "$XX.XX"
 */
export function formatPrice(amount: number): string {
    return `$${amount.toFixed(2)}`;
}

/**
 * Redondea a 2 decimales de forma precisa (evita errores de punto flotante)
 * @param value - Valor a redondear
 * @returns Número redondeado
 */
export function roundToTwo(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula el subtotal de una lista de items
 * NOTA: Los precios en la DB YA INCLUYEN IVA, así que este es el "total con IVA"
 * @param items - Array de items con price y quantity
 * @returns Suma total de precios (con IVA incluido)
 */
export function calculateSubtotal(
    items: Array<{ price: number; quantity: number }>
): number {
    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    return roundToTwo(subtotal);
}

// ============================================
// CÁLCULOS CUANDO EL PRECIO YA INCLUYE IVA
// ============================================

const IVA_RATE = 0.16;

/**
 * Extrae el subtotal SIN IVA de un precio que YA INCLUYE IVA
 * Fórmula: subtotal = precioConIVA / (1 + tasaIVA)
 * @param priceWithIVA - Precio que ya incluye IVA
 * @returns Subtotal sin IVA
 */
export function extractSubtotalFromPrice(priceWithIVA: number): number {
    return roundToTwo(priceWithIVA / (1 + IVA_RATE));
}

/**
 * Extrae el monto de IVA de un precio que YA INCLUYE IVA
 * Fórmula: iva = precioConIVA - (precioConIVA / 1.16)
 * @param priceWithIVA - Precio que ya incluye IVA
 * @returns Monto del IVA
 */
export function extractIVAFromPrice(priceWithIVA: number): number {
    const subtotal = extractSubtotalFromPrice(priceWithIVA);
    return roundToTwo(priceWithIVA - subtotal);
}

/**
 * Calcula el desglose de precios desde items cuyos precios YA INCLUYEN IVA
 * @param items - Array de items con price (incluye IVA) y quantity
 * @returns Objeto con subtotal (sin IVA), iva, y total (con IVA)
 */
export function calculatePriceBreakdown(
    items: Array<{ price: number; quantity: number }> | undefined | null
): { subtotal: number; iva: number; total: number } {
    // Manejar casos donde items es undefined, null o vacío
    if (!items || !Array.isArray(items) || items.length === 0) {
        return { subtotal: 0, iva: 0, total: 0 };
    }

    // El total es simplemente la suma de precios (ya incluyen IVA)
    const total = items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
    );

    // Extraer subtotal e IVA del total
    const subtotal = extractSubtotalFromPrice(total);
    const iva = extractIVAFromPrice(total);

    return {
        subtotal: roundToTwo(subtotal),
        iva: roundToTwo(iva),
        total: roundToTwo(total),
    };
}

// ============================================
// FUNCIONES LEGACY (para compatibilidad)
// ============================================

/**
 * Calcula el IVA (16%) de un subtotal SIN IVA
 * @deprecated Usar extractIVAFromPrice si el precio ya incluye IVA
 * @param subtotal - Subtotal base SIN IVA
 * @returns IVA calculado
 */
export function calculateIVA(subtotal: number): number {
    return roundToTwo(subtotal * IVA_RATE);
}

/**
 * Calcula el total (subtotal + IVA) desde un subtotal SIN IVA
 * @deprecated Los precios en DB ya incluyen IVA, usar calculatePriceBreakdown
 * @param subtotal - Subtotal base SIN IVA
 * @returns Total con IVA incluido
 */
export function calculateTotal(subtotal: number): number {
    return roundToTwo(subtotal + calculateIVA(subtotal));
}

/**
 * Calcula el cambio a devolver
 * @param total - Total de la venta
 * @param cashReceived - Efectivo recibido
 * @returns Cambio a devolver
 */
export function calculateChange(total: number, cashReceived: number): number {
    return roundToTwo(cashReceived - total);
}

/**
 * Formatea una fecha en español mexicano
 * @param date - Fecha a formatear
 * @returns String de fecha formateada
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "long",
    }).format(date);
}

/**
 * Formatea una fecha corta
 * @param date - Fecha a formatear
 * @returns String de fecha corta
 */
export function formatShortDate(date: Date): string {
    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

/**
 * Formatea hora
 * @param date - Fecha/hora a formatear
 * @returns String de hora formateada
 */
export function formatTime(date: Date): string {
    return new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

/**
 * Genera un ID único
 * @param prefix - Prefijo opcional para el ID
 * @returns ID único
 */
export function generateId(prefix: string = ""): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Genera un número de orden formateado
 * @param counter - Número del contador
 * @returns String formateado como "#001"
 */
export function formatOrderNumber(counter: number): string {
    return `#${counter.toString().padStart(3, "0")}`;
}
