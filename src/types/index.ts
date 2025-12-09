// ============================================
// TYPES - Sistema POS Pastes y Empanadas Tony
// ============================================

/**
 * Categorías disponibles en el menú
 */
export type ProductCategory =
    | "Pastes Salados"
    | "Empanadas Saladas"
    | "Empanadas Dulces"
    | "Bebidas"
    | "Promociones";

/**
 * Métodos de pago aceptados
 */
export type PaymentMethod = "cash" | "card" | "transfer";

/**
 * Estado de un pedido
 */
export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled";

/**
 * Tipo de pedido
 */
export type OrderType = "instant" | "preorder";

/**
 * Producto del catálogo
 */
export interface IProduct {
    id: string;
    name: string;
    price: number;
    category: ProductCategory;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
}

/**
 * Item en el carrito de compras
 */
export interface ICartItem extends IProduct {
    quantity: number;
}

/**
 * Item de un pedido (versión simplificada)
 */
export interface IOrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

/**
 * Información del cliente
 */
export interface ICustomer {
    name: string;
    phone: string;
    address?: string;
}

/**
 * Pedido completo
 */
export interface IOrder {
    id: string;
    type: OrderType;
    items: IOrderItem[];
    subtotal: number;
    iva: number;
    total: number;
    customer: ICustomer;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
    createdAt: Date;
    pickupDate?: Date;
    pickupTime?: string;
    advance?: number;
    cashReceived?: number;
    notes?: string;
}

/**
 * Venta completada
 */
export interface ISale {
    id: string;
    items: IOrderItem[];
    subtotal: number;
    iva: number;
    total: number;
    paymentMethod: PaymentMethod;
    cashReceived?: number;
    change?: number;
    timestamp: Date;
    employeeName: string;
}

/**
 * Empleado del sistema
 */
export interface IEmployee {
    id: string;
    name: string;
    pin?: string;
    role?: "cashier" | "admin" | "manager";
}

/**
 * Resumen de caja / corte
 */
export interface ICashRegisterSummary {
    date: Date;
    employeeName: string;
    totalSales: number;
    salesCount: number;
    cashTotal: number;
    cardTotal: number;
    transferTotal: number;
    sales: ISale[];
}

/**
 * Props comunes para modales
 */
export interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Contexto de sesión del usuario
 */
export interface ISessionContext {
    isLoggedIn: boolean;
    employee: IEmployee | null;
    login: (employeeId: string) => boolean;
    logout: () => void;
}

/**
 * Contexto del carrito
 */
export interface ICartContext {
    items: ICartItem[];
    subtotal: number;
    iva: number;
    total: number;
    itemCount: number;
    addItem: (product: IProduct) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}
