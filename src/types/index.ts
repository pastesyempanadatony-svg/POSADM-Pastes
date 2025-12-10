// ============================================
// TYPES - Sistema POS Pastes y Empanadas Tony
// Compartido entre POS y Admin Panel
// ============================================

import type { Timestamp } from "firebase/firestore";

// ============================================
// ENUMS Y TIPOS LITERALES
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
 * Roles de empleado
 */
export type EmployeeRole = "cashier" | "manager" | "admin";

// ============================================
// INTERFACES - SUCURSALES
// ============================================

/**
 * Sucursal/Branch
 */
export interface IBranch {
    id: string;
    name: string;
    address: string;
    phone: string;
    isActive: boolean;
    createdAt: Date | Timestamp;
}

/**
 * Datos para crear/actualizar sucursal
 */
export interface IBranchInput {
    name: string;
    address: string;
    phone: string;
    isActive?: boolean;
}

// ============================================
// INTERFACES - EMPLEADOS
// ============================================

/**
 * Empleado del sistema
 */
export interface IEmployee {
    id: string;
    name: string;
    pin: string; // PIN de 6 dígitos para login rápido
    branchId: string; // Sucursal a la que pertenece
    role: EmployeeRole;
    isActive: boolean;
    createdAt: Date | Timestamp;
}

/**
 * Datos para crear/actualizar empleado
 */
export interface IEmployeeInput {
    name: string;
    pin: string;
    branchId: string;
    role: EmployeeRole;
    isActive?: boolean;
}

/**
 * Empleado con información de sucursal (para UI)
 */
export interface IEmployeeWithBranch extends IEmployee {
    branchName: string;
}

// ============================================
// INTERFACES - PRODUCTOS
// ============================================

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
    isAvailable: boolean;
    createdAt?: Date | Timestamp;
}

/**
 * Datos para crear/actualizar producto
 */
export interface IProductInput {
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
 * Item de un pedido/venta (versión simplificada)
 */
export interface IOrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

// ============================================
// INTERFACES - CLIENTES
// ============================================

/**
 * Información del cliente
 */
export interface ICustomer {
    name: string;
    phone: string;
    address?: string;
}

// ============================================
// INTERFACES - VENTAS
// ============================================

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
    employeeId: string;
    employeeName: string;
    branchId: string;
    createdAt: Date | Timestamp;
}

/**
 * Datos para crear una venta
 */
export interface ISaleInput {
    items: IOrderItem[];
    subtotal: number;
    iva: number;
    total: number;
    paymentMethod: PaymentMethod;
    cashReceived?: number;
    change?: number;
}

/**
 * Resumen de caja / corte
 */
export interface ICashRegisterSummary {
    date: Date;
    employeeName: string;
    branchId: string;
    totalSales: number;
    salesCount: number;
    cashTotal: number;
    cardTotal: number;
    transferTotal: number;
    sales: ISale[];
}

// ============================================
// INTERFACES - PEDIDOS
// ============================================

/**
 * Pedido completo
 */
export interface IOrder {
    id: string;
    orderNumber: string;
    type: OrderType;
    items: IOrderItem[];
    subtotal: number;
    iva: number;
    total: number;
    customer: ICustomer;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
    pickupDate?: Date | Timestamp;
    pickupTime?: string;
    advance?: number;
    notes?: string;
    employeeId: string;
    branchId: string;
    createdAt: Date | Timestamp;
}

/**
 * Datos para crear un pedido
 */
export interface IOrderInput {
    type: OrderType;
    items: IOrderItem[];
    customer: ICustomer;
    paymentMethod: PaymentMethod;
    pickupDate?: Date;
    pickupTime?: string;
    advance?: number;
    notes?: string;
}

// ============================================
// INTERFACES - CONTEXTOS Y PROPS
// ============================================

/**
 * Props comunes para modales
 */
export interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Contexto de autenticación
 */
export interface IAuthContext {
    isAuthenticated: boolean;
    isLoading: boolean;
    employee: IEmployee | null;
    branch: IBranch | null;
    loginWithPin: (pin: string) => Promise<boolean>;
    logout: () => void;
    error: string | null;
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

// ============================================
// TIPOS UTILITARIOS
// ============================================

/**
 * Convierte Timestamps de Firestore a Date
 */
export type WithDates<T> = {
    [K in keyof T]: T[K] extends Timestamp ? Date : T[K];
};

/**
 * Tipo para documentos de Firestore (sin ID, ya que lo agrega Firestore)
 */
export type FirestoreDocument<T> = Omit<T, "id">;
