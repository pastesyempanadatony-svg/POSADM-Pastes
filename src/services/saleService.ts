// ============================================
// SaleService - Capa de servicios para Ventas
// ============================================

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    type DocumentData
} from "firebase/firestore";
import { db, COLLECTIONS, isFirebaseConfigured } from "../lib/firebase";
import type { ISale, ISaleInput, IOrderItem, PaymentMethod } from "../types";
import { generateId, roundToTwo } from "../utils/formatting";

// ============================================
// MOCK STORAGE (para desarrollo sin Firebase)
// ============================================

let mockSales: ISale[] = [];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Convierte un documento de Firestore a ISale
 */
function docToSale(doc: DocumentData, id: string): ISale {
    const data = doc;
    return {
        id,
        items: data.items || [],
        subtotal: data.subtotal,
        iva: data.iva,
        total: data.total,
        paymentMethod: data.paymentMethod,
        cashReceived: data.cashReceived,
        change: data.change,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        branchId: data.branchId,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    };
}

/**
 * Obtiene el inicio y fin del día para queries
 */
function getDayBounds(date: Date): { start: Date; end: Date } {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

// ============================================
// SERVICIOS
// ============================================

/**
 * Crea una nueva venta en Firestore
 * 
 * @param saleInput - Datos de la venta
 * @param employeeId - ID del empleado que realiza la venta
 * @param employeeName - Nombre del empleado
 * @param branchId - ID de la sucursal
 * @returns La venta creada con su ID
 */
export async function createSale(
    saleInput: ISaleInput,
    employeeId: string,
    employeeName: string,
    branchId: string
): Promise<ISale> {
    // Crear objeto base sin valores undefined (Firestore no los acepta)
    const saleData: Record<string, any> = {
        items: saleInput.items,
        subtotal: saleInput.subtotal,
        iva: saleInput.iva,
        total: saleInput.total,
        paymentMethod: saleInput.paymentMethod,
        employeeId,
        employeeName,
        branchId,
        createdAt: Timestamp.now(),
    };

    // Solo agregar campos opcionales si tienen valor
    if (saleInput.cashReceived !== undefined) {
        saleData.cashReceived = saleInput.cashReceived;
    }
    if (saleInput.change !== undefined) {
        saleData.change = saleInput.change;
    }

    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        const newSale: ISale = {
            id: generateId("sale"),
            items: saleInput.items,
            subtotal: saleInput.subtotal,
            iva: saleInput.iva,
            total: saleInput.total,
            paymentMethod: saleInput.paymentMethod,
            cashReceived: saleInput.cashReceived,
            change: saleInput.change,
            employeeId,
            employeeName,
            branchId,
            createdAt: new Date(),
        };
        mockSales.push(newSale);
        console.log("📝 Venta guardada (mock):", newSale.id);
        return newSale;
    }

    try {
        const salesRef = collection(db, COLLECTIONS.SALES);
        const docRef = await addDoc(salesRef, saleData);

        const newSale: ISale = {
            ...saleInput,
            id: docRef.id,
            employeeId,
            employeeName,
            branchId,
            createdAt: new Date(),
        };

        console.log("✅ Venta guardada en Firestore:", docRef.id);
        return newSale;
    } catch (error) {
        console.error("❌ Error guardando venta:", error);
        throw new Error("No se pudo guardar la venta");
    }
}

/**
 * Obtiene las ventas del día para una sucursal específica
 * 
 * @param date - Fecha a consultar
 * @param branchId - ID de la sucursal
 * @returns Array de ventas del día
 */
export async function getDailySales(date: Date, branchId: string): Promise<ISale[]> {
    const { start, end } = getDayBounds(date);

    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        return mockSales.filter(sale => {
            const saleDate = sale.createdAt instanceof Date
                ? sale.createdAt
                : new Date(sale.createdAt as unknown as string);
            return (
                sale.branchId === branchId &&
                saleDate >= start &&
                saleDate <= end
            );
        });
    }

    try {
        const salesRef = collection(db, COLLECTIONS.SALES);
        const q = query(
            salesRef,
            where("branchId", "==", branchId),
            where("createdAt", ">=", Timestamp.fromDate(start)),
            where("createdAt", "<=", Timestamp.fromDate(end)),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToSale(doc.data(), doc.id));
    } catch (error) {
        console.error("❌ Error obteniendo ventas:", error);
        throw new Error("No se pudieron obtener las ventas");
    }
}

/**
 * Obtiene las ventas de un empleado en un día específico
 * 
 * @param date - Fecha a consultar
 * @param employeeId - ID del empleado
 * @returns Array de ventas del empleado
 */
export async function getEmployeeDailySales(
    date: Date,
    employeeId: string
): Promise<ISale[]> {
    const { start, end } = getDayBounds(date);

    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        return mockSales.filter(sale => {
            const saleDate = sale.createdAt instanceof Date
                ? sale.createdAt
                : new Date(sale.createdAt as unknown as string);
            return (
                sale.employeeId === employeeId &&
                saleDate >= start &&
                saleDate <= end
            );
        });
    }

    try {
        const salesRef = collection(db, COLLECTIONS.SALES);
        const q = query(
            salesRef,
            where("employeeId", "==", employeeId),
            where("createdAt", ">=", Timestamp.fromDate(start)),
            where("createdAt", "<=", Timestamp.fromDate(end)),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToSale(doc.data(), doc.id));
    } catch (error) {
        console.error("❌ Error obteniendo ventas del empleado:", error);
        throw new Error("No se pudieron obtener las ventas");
    }
}

/**
 * Calcula el resumen de ventas por método de pago
 */
export function calculateSalesSummary(sales: ISale[]): {
    totalSales: number;
    salesCount: number;
    cashTotal: number;
    cardTotal: number;
    transferTotal: number;
} {
    const cashSales = sales.filter(s => s.paymentMethod === "cash");
    const cardSales = sales.filter(s => s.paymentMethod === "card");
    const transferSales = sales.filter(s => s.paymentMethod === "transfer");

    return {
        totalSales: roundToTwo(sales.reduce((sum, s) => sum + s.total, 0)),
        salesCount: sales.length,
        cashTotal: roundToTwo(cashSales.reduce((sum, s) => sum + s.total, 0)),
        cardTotal: roundToTwo(cardSales.reduce((sum, s) => sum + s.total, 0)),
        transferTotal: roundToTwo(transferSales.reduce((sum, s) => sum + s.total, 0)),
    };
}

/**
 * Limpia las ventas mock (para desarrollo)
 */
export function clearMockSales(): void {
    mockSales = [];
}

/**
 * Obtiene todas las ventas mock (para desarrollo)
 */
export function getMockSales(): ISale[] {
    return [...mockSales];
}
