// ============================================
// POSApp - Aplicación completa del POS
// ============================================

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";

// Componentes
import { LoginScreen } from "../components/LoginScreen";
import { MainLayout } from "../components/layout";
import { POSScreen } from "../components/pos/POSScreen";
import { OrderManagementScreen } from "../components/OrderManagementScreen";
import { EndOfDayScreen } from "../components/EndOfDayScreen";
import { ConfirmationModal } from "../components/ConfirmationModal";

// Servicios
import {
    createSale,
    getMockSales,
    clearMockSales,
    calculateSalesSummary
} from "../services/saleService";
import {
    createOrder,
    getMockOrders,
    clearMockOrders,
    updateOrderStatus
} from "../services/orderService";
import { products } from "../data/products";

// Tipos
import type { ISale, IOrder, PaymentMethod } from "../types";

type Screen = "sales" | "orders" | "reports";

/**
 * Aplicación principal del POS
 * Usa el AuthContext para autenticación por PIN
 */
export function POSApp() {
    // ============================================
    // AUTH CONTEXT
    // ============================================
    const {
        isAuthenticated,
        isLoading,
        employee,
        branch,
        loginWithPin,
        logout,
        error: authError
    } = useAuth();

    // ============================================
    // HOOKS
    // ============================================
    const cart = useCart();

    // ============================================
    // ESTADO LOCAL
    // ============================================
    const [currentScreen, setCurrentScreen] = useState<Screen>("sales");
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
    const [sales, setSales] = useState<ISale[]>([]);
    const [orders, setOrders] = useState<IOrder[]>([]);

    // Actualizar ventas y pedidos cuando cambia la autenticación
    useEffect(() => {
        if (isAuthenticated) {
            setSales(getMockSales());
            setOrders(getMockOrders());
        }
    }, [isAuthenticated]);

    // ============================================
    // HANDLERS - LOGIN
    // ============================================

    const handleLogin = async (employeeId: string) => {
        await loginWithPin(employeeId);
    };

    // ============================================
    // HANDLERS - VENTAS
    // ============================================

    const handleRegisterSale = async (
        paymentMethod: PaymentMethod,
        cashReceived?: number
    ) => {
        if (!employee || !branch) return;

        const saleInput = {
            items: cart.getOrderItems(),
            subtotal: cart.subtotal,
            iva: cart.iva,
            total: cart.total,
            paymentMethod,
            cashReceived,
            change: cashReceived ? cashReceived - cart.total : undefined,
        };

        const newSale = await createSale(
            saleInput,
            employee.id,
            employee.name,
            branch.id
        );

        setSales(prev => [...prev, newSale]);
        cart.clearCart();
    };

    // ============================================
    // HANDLERS - PEDIDOS
    // ============================================

    const handleCreateInstantOrder = async (customerData: {
        clientName: string;
        phone: string;
        address: string;
        paymentMethod: PaymentMethod;
    }) => {
        if (!employee || !branch) return;

        const newOrder = await createOrder(
            {
                type: "instant",
                items: cart.getOrderItems(),
                customer: {
                    name: customerData.clientName,
                    phone: customerData.phone,
                    address: customerData.address,
                },
                paymentMethod: customerData.paymentMethod,
            },
            employee.id,
            branch.id
        );

        setOrders(prev => [...prev, newOrder]);
        cart.clearCart();
    };

    const handleCreatePreOrder = async (orderData: {
        clientName: string;
        phone: string;
        address: string;
        date: Date;
        time: string;
        items: Array<{ id: string; name: string; price: number; quantity: number }>;
        total: number;
        advance: number;
        paymentMethod: PaymentMethod;
    }) => {
        if (!employee || !branch) return;

        const newOrder = await createOrder(
            {
                type: "preorder",
                items: orderData.items,
                customer: {
                    name: orderData.clientName,
                    phone: orderData.phone,
                    address: orderData.address,
                },
                paymentMethod: orderData.paymentMethod,
                pickupDate: orderData.date,
                pickupTime: orderData.time,
                advance: orderData.advance,
            },
            employee.id,
            branch.id
        );

        setOrders(prev => [...prev, newOrder]);
    };

    const handleMarkAsDelivered = async (orderId: string) => {
        await updateOrderStatus(orderId, "delivered");
        setOrders(prev =>
            prev.map(o => o.id === orderId ? { ...o, status: "delivered" as const } : o)
        );
    };

    const handlePrintOrder = (orderId: string) => {
        console.log(`Imprimiendo pedido ${orderId}...`);
        alert(`Imprimiendo pedido ${orderId}...`);
    };

    // ============================================
    // HANDLERS - LOGOUT
    // ============================================

    const handleLogoutRequest = () => {
        setShowLogoutConfirmation(true);
    };

    const handleLogoutConfirm = () => {
        cart.clearCart();
        logout();
        setCurrentScreen("sales");
        setShowLogoutConfirmation(false);
    };

    const handleEndShift = () => {
        cart.clearCart();
        clearMockSales();
        clearMockOrders();
        setSales([]);
        setOrders([]);
        logout();
        setCurrentScreen("sales");
    };

    // ============================================
    // RENDER - LOADING
    // ============================================

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER - LOGIN
    // ============================================

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    // ============================================
    // RENDER - APP
    // ============================================

    // Preparar datos para componentes
    const instantOrders = orders.filter(o => o.type === "instant");
    const preOrders = orders.filter(o => o.type === "preorder");

    // Objeto sales para POSScreen (compatible con la interfaz anterior)
    const salesHook = {
        sales,
        salesCount: sales.length,
        summary: {
            date: new Date(),
            employeeName: employee?.name || "",
            branchId: branch?.id || "",
            ...calculateSalesSummary(sales),
            sales,
        },
        paymentBreakdown: {
            cash: { count: sales.filter(s => s.paymentMethod === "cash").length, total: 0 },
            card: { count: sales.filter(s => s.paymentMethod === "card").length, total: 0 },
            transfer: { count: sales.filter(s => s.paymentMethod === "transfer").length, total: 0 },
        },
        registerSale: async (data: {
            items: any[];
            subtotal: number;
            paymentMethod: PaymentMethod;
            cashReceived?: number
        }) => {
            await handleRegisterSale(data.paymentMethod, data.cashReceived);
            return {} as ISale;
        },
        clearSales: () => setSales([]),
        getRecentSales: (count: number = 5) => [...sales].reverse().slice(0, count),
    };

    // Objeto orders para POSScreen
    const ordersHook = {
        orders,
        instantOrders,
        preOrders,
        pendingOrders: orders.filter(o => o.status === "pending"),
        orderCounter: orders.length + 1,
        createInstantOrder: handleCreateInstantOrder as any,
        createPreOrder: handleCreatePreOrder as any,
        updateOrderStatus: async (id: string, status: any) => {
            await updateOrderStatus(id, status);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        },
        markAsDelivered: handleMarkAsDelivered,
        cancelOrder: async (id: string) => {
            await updateOrderStatus(id, "cancelled");
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "cancelled" as const } : o));
        },
        clearOrders: () => setOrders([]),
        getOrdersByType: (type: "instant" | "preorder") => orders.filter(o => o.type === type),
        getOrderById: (id: string) => orders.find(o => o.id === id),
        getNextOrderNumber: () => `#${(orders.length + 1).toString().padStart(3, "0")}`,
    };

    return (
        <>
            <MainLayout
                currentScreen={currentScreen}
                onScreenChange={setCurrentScreen}
                employeeName={employee?.name || ""}
                onLogout={handleLogoutRequest}
                salesCount={sales.length}
            >
                {/* Pantalla de Ventas */}
                {currentScreen === "sales" && (
                    <POSScreen
                        cart={cart}
                        sales={salesHook}
                        orders={ordersHook}
                    />
                )}

                {/* Pantalla de Pedidos */}
                {currentScreen === "orders" && (
                    <OrderManagementScreen
                        products={products}
                        instantOrders={instantOrders.map(o => ({
                            id: o.id,
                            type: o.type,
                            items: o.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
                            total: o.total,
                            clientName: o.customer.name,
                            phone: o.customer.phone,
                            address: o.customer.address,
                            paymentMethod: o.paymentMethod,
                            status: o.status as "pending" | "delivered",
                            createdAt: o.createdAt instanceof Date ? o.createdAt : new Date(),
                        }))}
                        preOrders={preOrders.map(o => ({
                            id: o.id,
                            type: o.type,
                            items: o.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
                            total: o.total,
                            clientName: o.customer.name,
                            phone: o.customer.phone,
                            address: o.customer.address,
                            pickupDate: o.pickupDate instanceof Date ? o.pickupDate : undefined,
                            pickupTime: o.pickupTime,
                            advance: o.advance,
                            paymentMethod: o.paymentMethod,
                            status: o.status as "pending" | "delivered",
                            createdAt: o.createdAt instanceof Date ? o.createdAt : new Date(),
                        }))}
                        onCreatePreOrder={handleCreatePreOrder}
                        onMarkAsDelivered={handleMarkAsDelivered}
                        onPrintOrder={handlePrintOrder}
                    />
                )}

                {/* Pantalla de Corte de Caja */}
                {currentScreen === "reports" && (
                    <EndOfDayScreen
                        sales={sales.map(s => ({
                            items: s.items,
                            subtotal: s.subtotal,
                            iva: s.iva,
                            total: s.total,
                            paymentMethod: s.paymentMethod,
                            cashReceived: s.cashReceived,
                            timestamp: s.createdAt instanceof Date ? s.createdAt : new Date(),
                        }))}
                        employeeName={employee?.name || ""}
                        onEndShift={handleEndShift}
                    />
                )}
            </MainLayout>

            {/* Modal de confirmación de logout */}
            <ConfirmationModal
                isOpen={showLogoutConfirmation}
                onClose={() => setShowLogoutConfirmation(false)}
                type="warning"
                title="¿Cerrar sesión?"
                message="Si cierras sesión, el carrito actual se perderá."
                confirmText="Sí, cerrar"
                cancelText="Cancelar"
                onConfirm={handleLogoutConfirm}
            />
        </>
    );
}
