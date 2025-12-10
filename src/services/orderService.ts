// ============================================
// OrderService - Capa de servicios para Pedidos
// ============================================

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    type DocumentData
} from "firebase/firestore";
import { db, COLLECTIONS, isFirebaseConfigured } from "../lib/firebase";
import type { IOrder, IOrderInput, OrderStatus } from "../types";
import { generateId, formatOrderNumber, calculateSubtotal, calculateIVA, calculateTotal } from "../utils/formatting";

// ============================================
// MOCK STORAGE (para desarrollo sin Firebase)
// ============================================

let mockOrders: IOrder[] = [];
let mockOrderCounter = 1;

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Convierte un documento de Firestore a IOrder
 */
function docToOrder(data: DocumentData, id: string): IOrder {
    return {
        id,
        orderNumber: data.orderNumber,
        type: data.type,
        items: data.items || [],
        subtotal: data.subtotal,
        iva: data.iva,
        total: data.total,
        customer: data.customer,
        paymentMethod: data.paymentMethod,
        status: data.status,
        pickupDate: data.pickupDate?.toDate?.() || data.pickupDate,
        pickupTime: data.pickupTime,
        advance: data.advance,
        notes: data.notes,
        employeeId: data.employeeId,
        branchId: data.branchId,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    };
}

// ============================================
// SERVICIOS
// ============================================

/**
 * Crea un nuevo pedido
 * 
 * @param orderInput - Datos del pedido
 * @param employeeId - ID del empleado
 * @param branchId - ID de la sucursal
 * @returns El pedido creado con su ID
 */
export async function createOrder(
    orderInput: IOrderInput,
    employeeId: string,
    branchId: string
): Promise<IOrder> {
    const subtotal = calculateSubtotal(orderInput.items);
    const iva = calculateIVA(subtotal);
    const total = calculateTotal(subtotal);

    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        const orderNumber = formatOrderNumber(mockOrderCounter++);
        const newOrder: IOrder = {
            id: generateId("order"),
            orderNumber,
            ...orderInput,
            subtotal,
            iva,
            total,
            status: "pending",
            employeeId,
            branchId,
            createdAt: new Date(),
        };
        mockOrders.push(newOrder);
        console.log("📝 Pedido guardado (mock):", newOrder.orderNumber);
        return newOrder;
    }

    try {
        // Obtener el contador de pedidos (en producción usar una transacción)
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const countSnapshot = await getDocs(ordersRef);
        const orderNumber = formatOrderNumber(countSnapshot.size + 1);

        const orderData = {
            orderNumber,
            ...orderInput,
            subtotal,
            iva,
            total,
            status: "pending" as OrderStatus,
            employeeId,
            branchId,
            pickupDate: orderInput.pickupDate ? Timestamp.fromDate(orderInput.pickupDate) : null,
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(ordersRef, orderData);

        console.log("✅ Pedido guardado en Firestore:", orderNumber);

        return {
            id: docRef.id,
            orderNumber,
            ...orderInput,
            subtotal,
            iva,
            total,
            status: "pending",
            employeeId,
            branchId,
            createdAt: new Date(),
        };
    } catch (error) {
        console.error("❌ Error guardando pedido:", error);
        throw new Error("No se pudo guardar el pedido");
    }
}

/**
 * Obtiene pedidos pendientes de una sucursal
 * 
 * @param branchId - ID de la sucursal
 * @returns Array de pedidos pendientes
 */
export async function getPendingOrders(branchId: string): Promise<IOrder[]> {
    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        return mockOrders.filter(
            order => order.branchId === branchId &&
                order.status !== "delivered" &&
                order.status !== "cancelled"
        );
    }

    try {
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const q = query(
            ordersRef,
            where("branchId", "==", branchId),
            where("status", "in", ["pending", "preparing", "ready"]),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToOrder(doc.data(), doc.id));
    } catch (error) {
        console.error("❌ Error obteniendo pedidos:", error);
        return [];
    }
}

/**
 * Obtiene pedidos por tipo
 * 
 * @param branchId - ID de la sucursal
 * @param type - Tipo de pedido ("instant" | "preorder")
 * @returns Array de pedidos del tipo especificado
 */
export async function getOrdersByType(
    branchId: string,
    type: "instant" | "preorder"
): Promise<IOrder[]> {
    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        return mockOrders.filter(
            order => order.branchId === branchId && order.type === type
        );
    }

    try {
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const q = query(
            ordersRef,
            where("branchId", "==", branchId),
            where("type", "==", type),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToOrder(doc.data(), doc.id));
    } catch (error) {
        console.error("❌ Error obteniendo pedidos:", error);
        return [];
    }
}

/**
 * Actualiza el estado de un pedido
 * 
 * @param orderId - ID del pedido
 * @param status - Nuevo estado
 */
export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus
): Promise<void> {
    // Si Firebase no está configurado, actualizar mock
    if (!isFirebaseConfigured()) {
        const order = mockOrders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
        }
        return;
    }

    try {
        const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
        await updateDoc(orderRef, {
            status,
            updatedAt: Timestamp.now()
        });
        console.log("✅ Estado del pedido actualizado:", orderId, status);
    } catch (error) {
        console.error("❌ Error actualizando pedido:", error);
        throw new Error("No se pudo actualizar el pedido");
    }
}

/**
 * Marca un pedido como entregado
 */
export async function markOrderAsDelivered(orderId: string): Promise<void> {
    await updateOrderStatus(orderId, "delivered");
}

/**
 * Cancela un pedido
 */
export async function cancelOrder(orderId: string): Promise<void> {
    await updateOrderStatus(orderId, "cancelled");
}

/**
 * Obtiene los pedidos del día para una sucursal
 */
export async function getTodayOrders(branchId: string): Promise<IOrder[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        return mockOrders.filter(order => {
            const orderDate = order.createdAt instanceof Date
                ? order.createdAt
                : new Date(order.createdAt as unknown as string);
            return (
                order.branchId === branchId &&
                orderDate >= today &&
                orderDate < tomorrow
            );
        });
    }

    try {
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const q = query(
            ordersRef,
            where("branchId", "==", branchId),
            where("createdAt", ">=", Timestamp.fromDate(today)),
            where("createdAt", "<", Timestamp.fromDate(tomorrow)),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToOrder(doc.data(), doc.id));
    } catch (error) {
        console.error("❌ Error obteniendo pedidos del día:", error);
        return [];
    }
}

/**
 * Limpia los pedidos mock (para desarrollo)
 */
export function clearMockOrders(): void {
    mockOrders = [];
    mockOrderCounter = 1;
}

/**
 * Obtiene todos los pedidos mock (para desarrollo)
 */
export function getMockOrders(): IOrder[] {
    return [...mockOrders];
}
