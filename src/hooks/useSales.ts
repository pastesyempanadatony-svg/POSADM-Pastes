// ============================================
// HOOK - useSales (Gestión de ventas)
// ============================================

import { useState, useCallback, useMemo } from "react";
import type { ISale, IOrderItem, PaymentMethod, ICashRegisterSummary } from "../types";
import { generateId, roundToTwo, calculateIVA, calculateTotal } from "../utils/formatting";

/**
 * Hook personalizado para gestionar las ventas del día
 */
export function useSales(employeeName: string) {
    const [sales, setSales] = useState<ISale[]>([]);

    /**
     * Registra una nueva venta
     */
    const registerSale = useCallback(
        (saleData: {
            items: IOrderItem[];
            subtotal: number;
            paymentMethod: PaymentMethod;
            cashReceived?: number;
        }): ISale => {
            const iva = calculateIVA(saleData.subtotal);
            const total = calculateTotal(saleData.subtotal);
            const change = saleData.cashReceived
                ? roundToTwo(saleData.cashReceived - total)
                : undefined;

            const newSale: ISale = {
                id: generateId("sale"),
                items: saleData.items,
                subtotal: saleData.subtotal,
                iva,
                total,
                paymentMethod: saleData.paymentMethod,
                cashReceived: saleData.cashReceived,
                change,
                timestamp: new Date(),
                employeeName,
            };

            setSales((prev) => [...prev, newSale]);
            return newSale;
        },
        [employeeName]
    );

    /**
     * Resumen del día (memoizado)
     */
    const summary = useMemo((): ICashRegisterSummary => {
        const cashSales = sales.filter((s) => s.paymentMethod === "cash");
        const cardSales = sales.filter((s) => s.paymentMethod === "card");
        const transferSales = sales.filter((s) => s.paymentMethod === "transfer");

        return {
            date: new Date(),
            employeeName,
            totalSales: roundToTwo(sales.reduce((sum, s) => sum + s.total, 0)),
            salesCount: sales.length,
            cashTotal: roundToTwo(cashSales.reduce((sum, s) => sum + s.total, 0)),
            cardTotal: roundToTwo(cardSales.reduce((sum, s) => sum + s.total, 0)),
            transferTotal: roundToTwo(transferSales.reduce((sum, s) => sum + s.total, 0)),
            sales,
        };
    }, [sales, employeeName]);

    /**
     * Resumen por método de pago
     */
    const paymentBreakdown = useMemo(() => {
        return {
            cash: {
                count: sales.filter((s) => s.paymentMethod === "cash").length,
                total: summary.cashTotal,
            },
            card: {
                count: sales.filter((s) => s.paymentMethod === "card").length,
                total: summary.cardTotal,
            },
            transfer: {
                count: sales.filter((s) => s.paymentMethod === "transfer").length,
                total: summary.transferTotal,
            },
        };
    }, [sales, summary]);

    /**
     * Limpia todas las ventas (para fin de turno)
     */
    const clearSales = useCallback(() => {
        setSales([]);
    }, []);

    /**
     * Obtiene las últimas N ventas
     */
    const getRecentSales = useCallback(
        (count: number = 5): ISale[] => {
            return [...sales].reverse().slice(0, count);
        },
        [sales]
    );

    return {
        // Estado
        sales,
        salesCount: sales.length,

        // Resumen
        summary,
        paymentBreakdown,

        // Acciones
        registerSale,
        clearSales,

        // Utilidades
        getRecentSales,
    };
}

/**
 * Tipo de retorno del hook useSales
 */
export type UseSalesReturn = ReturnType<typeof useSales>;
