// ============================================
// HOOK - useOrders (Gestión de pedidos)
// ============================================

import { useState, useCallback, useMemo } from "react";
import type { IOrder, IOrderItem, ICustomer, PaymentMethod, OrderType, OrderStatus } from "../types";
import { generateId, formatOrderNumber, roundToTwo, calculateIVA, calculateTotal, calculateSubtotal } from "../utils/formatting";

/**
 * Hook personalizado para gestionar pedidos
 */
export function useOrders() {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [orderCounter, setOrderCounter] = useState(1);

    /**
     * Genera el siguiente número de orden
     */
    const getNextOrderNumber = useCallback((): string => {
        const number = formatOrderNumber(orderCounter);
        setOrderCounter((prev) => prev + 1);
        return number;
    }, [orderCounter]);

    /**
     * Crea un nuevo pedido instantáneo
     */
    const createInstantOrder = useCallback(
        (data: {
            items: IOrderItem[];
            customer: ICustomer;
            paymentMethod: PaymentMethod;
        }): IOrder => {
            const subtotal = calculateSubtotal(data.items);
            const iva = calculateIVA(subtotal);
            const total = calculateTotal(subtotal);

            const newOrder: IOrder = {
                id: getNextOrderNumber(),
                type: "instant",
                items: data.items,
                subtotal,
                iva,
                total,
                customer: data.customer,
                paymentMethod: data.paymentMethod,
                status: "pending",
                createdAt: new Date(),
            };

            setOrders((prev) => [...prev, newOrder]);
            return newOrder;
        },
        [getNextOrderNumber]
    );

    /**
     * Crea un nuevo pedido anticipado
     */
    const createPreOrder = useCallback(
        (data: {
            items: IOrderItem[];
            customer: ICustomer;
            paymentMethod: PaymentMethod;
            pickupDate: Date;
            pickupTime: string;
            advance?: number;
        }): IOrder => {
            const subtotal = calculateSubtotal(data.items);
            const iva = calculateIVA(subtotal);
            const total = calculateTotal(subtotal);

            const newOrder: IOrder = {
                id: getNextOrderNumber(),
                type: "preorder",
                items: data.items,
                subtotal,
                iva,
                total,
                customer: data.customer,
                paymentMethod: data.paymentMethod,
                status: "pending",
                createdAt: new Date(),
                pickupDate: data.pickupDate,
                pickupTime: data.pickupTime,
                advance: data.advance,
            };

            setOrders((prev) => [...prev, newOrder]);
            return newOrder;
        },
        [getNextOrderNumber]
    );

    /**
     * Actualiza el estado de un pedido
     */
    const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status } : order
            )
        );
    }, []);

    /**
     * Marca un pedido como entregado
     */
    const markAsDelivered = useCallback((orderId: string) => {
        updateOrderStatus(orderId, "delivered");
    }, [updateOrderStatus]);

    /**
     * Cancela un pedido
     */
    const cancelOrder = useCallback((orderId: string) => {
        updateOrderStatus(orderId, "cancelled");
    }, [updateOrderStatus]);

    /**
     * Filtra pedidos por tipo
     */
    const getOrdersByType = useCallback(
        (type: OrderType): IOrder[] => {
            return orders.filter((order) => order.type === type);
        },
        [orders]
    );

    /**
     * Pedidos instantáneos (memoizado)
     */
    const instantOrders = useMemo(
        () => orders.filter((o) => o.type === "instant"),
        [orders]
    );

    /**
     * Pedidos anticipados (memoizado)
     */
    const preOrders = useMemo(
        () => orders.filter((o) => o.type === "preorder"),
        [orders]
    );

    /**
     * Pedidos pendientes
     */
    const pendingOrders = useMemo(
        () => orders.filter((o) => o.status === "pending"),
        [orders]
    );

    /**
     * Limpia todos los pedidos (para fin de turno)
     */
    const clearOrders = useCallback(() => {
        setOrders([]);
        setOrderCounter(1);
    }, []);

    /**
     * Busca un pedido por ID
     */
    const getOrderById = useCallback(
        (orderId: string): IOrder | undefined => {
            return orders.find((o) => o.id === orderId);
        },
        [orders]
    );

    return {
        // Estado
        orders,
        instantOrders,
        preOrders,
        pendingOrders,
        orderCounter,

        // Acciones
        createInstantOrder,
        createPreOrder,
        updateOrderStatus,
        markAsDelivered,
        cancelOrder,
        clearOrders,

        // Utilidades
        getOrdersByType,
        getOrderById,
        getNextOrderNumber,
    };
}

/**
 * Tipo de retorno del hook useOrders
 */
export type UseOrdersReturn = ReturnType<typeof useOrders>;
