// ============================================
// HOOK - useCart (Gestión del carrito)
// ============================================

import { useState, useCallback, useMemo } from "react";
import type { IProduct, ICartItem, IOrderItem } from "../types";
import { calculatePriceBreakdown } from "../utils/formatting";

/**
 * Hook personalizado para gestionar el carrito de compras
 */
export function useCart() {
    const [items, setItems] = useState<ICartItem[]>([]);

    /**
     * Agrega un producto al carrito
     * Si ya existe, incrementa la cantidad
     */
    const addItem = useCallback((product: IProduct) => {
        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.id === product.id);

            if (existingItem) {
                return currentItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentItems, { ...product, quantity: 1 }];
        });
    }, []);

    /**
     * Elimina un producto del carrito por completo
     */
    const removeItem = useCallback((productId: string) => {
        setItems((currentItems) =>
            currentItems.filter((item) => item.id !== productId)
        );
    }, []);

    /**
     * Actualiza la cantidad de un producto
     * Si la cantidad es 0 o menor, elimina el producto
     */
    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems((currentItems) =>
                currentItems.filter((item) => item.id !== productId)
            );
            return;
        }

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    }, []);

    /**
     * Incrementa la cantidad de un producto en 1
     */
    const incrementQuantity = useCallback((productId: string) => {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    }, []);

    /**
     * Decrementa la cantidad de un producto en 1
     * Si llega a 0, no hace nada (usar removeItem para eliminar)
     */
    const decrementQuantity = useCallback((productId: string) => {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === productId && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    }, []);

    /**
     * Limpia todo el carrito
     */
    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    /**
     * Cálculos derivados (memoizados para rendimiento)
     * Los precios de productos YA INCLUYEN IVA, así que:
     * - total = suma de precios * cantidad
     * - subtotal = total / 1.16 (precio sin IVA)
     * - iva = total - subtotal
     */
    const calculations = useMemo(() => {
        const breakdown = calculatePriceBreakdown(items);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            subtotal: breakdown.subtotal,  // Sin IVA
            iva: breakdown.iva,             // Monto del IVA
            total: breakdown.total,         // Con IVA (suma de precios)
            itemCount
        };
    }, [items]);

    /**
     * Convierte los items del carrito a formato de orden
     */
    const getOrderItems = useCallback((): IOrderItem[] => {
        return items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));
    }, [items]);

    /**
     * Verifica si el carrito está vacío
     */
    const isEmpty = items.length === 0;

    /**
     * Verifica si un producto está en el carrito
     */
    const hasItem = useCallback(
        (productId: string): boolean => {
            return items.some((item) => item.id === productId);
        },
        [items]
    );

    /**
     * Obtiene la cantidad de un producto específico
     */
    const getItemQuantity = useCallback(
        (productId: string): number => {
            const item = items.find((i) => i.id === productId);
            return item?.quantity ?? 0;
        },
        [items]
    );

    return {
        // Estado
        items,
        isEmpty,

        // Cálculos
        subtotal: calculations.subtotal,
        iva: calculations.iva,
        total: calculations.total,
        itemCount: calculations.itemCount,

        // Acciones
        addItem,
        removeItem,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        clearCart,

        // Utilidades
        getOrderItems,
        hasItem,
        getItemQuantity,
    };
}

/**
 * Tipo de retorno del hook useCart
 */
export type UseCartReturn = ReturnType<typeof useCart>;
