// ============================================
// App.tsx - Punto de entrada refactorizado
// Sistema POS - Pastes y Empanadas Tony
// ============================================

import { useState } from "react";

// Hooks personalizados
import { useCart, useSales, useSession, useOrders } from "./hooks";

// Componentes de layout
import { MainLayout } from "./components/layout";

// Pantallas/Screens
import { LoginScreen } from "./components/LoginScreen";
import { POSScreen } from "./components/pos/POSScreen";
import { OrderManagementScreen } from "./components/OrderManagementScreen";
import { EndOfDayScreen } from "./components/EndOfDayScreen";

// Modales
import { ConfirmationModal } from "./components/ConfirmationModal";

// Datos
import { products } from "./data/products";

// Tipos
type Screen = "sales" | "orders" | "reports";

/**
 * Componente principal de la aplicación POS
 * Arquitectura limpia usando hooks personalizados para la lógica de negocio
 */
export default function App() {
  // ============================================
  // HOOKS - Lógica de negocio extraída
  // ============================================

  // Gestión de sesión (login/logout)
  const session = useSession();

  // Gestión del carrito de compras
  const cart = useCart();

  // Gestión de ventas del día
  const sales = useSales(session.employeeName);

  // Gestión de pedidos (instantáneos y anticipados)
  const orders = useOrders();

  // ============================================
  // ESTADO LOCAL DE UI
  // ============================================

  const [currentScreen, setCurrentScreen] = useState<Screen>("sales");
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Maneja el login del empleado
   */
  const handleLogin = (employeeName: string) => {
    // El LoginScreen ya valida el empleado, aquí solo actualizamos el estado
    // Buscamos por nombre (el componente LoginScreen devuelve el nombre)
    session.login("999999"); // Temporal - el LoginScreen debería devolver el ID
  };

  /**
   * Solicita confirmación para cerrar sesión
   */
  const handleLogoutRequest = () => {
    setShowLogoutConfirmation(true);
  };

  /**
   * Confirma el cierre de sesión
   */
  const handleLogoutConfirm = () => {
    // Limpiar todo el estado
    cart.clearCart();
    session.logout();
    setCurrentScreen("sales");
    setShowLogoutConfirmation(false);
  };

  /**
   * Finaliza el turno (desde Corte de Caja)
   */
  const handleEndShift = () => {
    cart.clearCart();
    sales.clearSales();
    orders.clearOrders();
    session.logout();
    setCurrentScreen("sales");
  };

  /**
   * Crea un pedido anticipado
   */
  const handleCreatePreOrder = (orderData: {
    clientName: string;
    phone: string;
    address: string;
    date: Date;
    time: string;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
    advance: number;
    paymentMethod: "cash" | "card" | "transfer";
  }) => {
    orders.createPreOrder({
      items: orderData.items,
      customer: {
        name: orderData.clientName,
        phone: orderData.phone,
        address: orderData.address,
      },
      pickupDate: orderData.date,
      pickupTime: orderData.time,
      advance: orderData.advance,
      paymentMethod: orderData.paymentMethod,
    });
  };

  /**
   * Marca un pedido como entregado
   */
  const handleMarkAsDelivered = (orderId: string) => {
    orders.markAsDelivered(orderId);
  };

  /**
   * Imprime un pedido (placeholder)
   */
  const handlePrintOrder = (orderId: string) => {
    // TODO: Implementar integración con impresora
    console.log(`Imprimiendo pedido ${orderId}...`);
    alert(`Imprimiendo pedido ${orderId}...`);
  };

  // ============================================
  // RENDER - Pantalla de login
  // ============================================

  if (!session.isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ============================================
  // RENDER - Aplicación principal
  // ============================================

  return (
    <>
      <MainLayout
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        employeeName={session.employeeName}
        onLogout={handleLogoutRequest}
        salesCount={sales.salesCount}
      >
        {/* Pantalla de Ventas (POS) */}
        {currentScreen === "sales" && (
          <POSScreen
            cart={cart}
            sales={sales}
            orders={orders}
          />
        )}

        {/* Pantalla de Gestión de Pedidos */}
        {currentScreen === "orders" && (
          <OrderManagementScreen
            products={products}
            instantOrders={orders.instantOrders.map(o => ({
              id: o.id,
              type: o.type,
              items: o.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
              total: o.total,
              clientName: o.customer.name,
              phone: o.customer.phone,
              address: o.customer.address,
              paymentMethod: o.paymentMethod,
              status: o.status,
              createdAt: o.createdAt,
            }))}
            preOrders={orders.preOrders.map(o => ({
              id: o.id,
              type: o.type,
              items: o.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
              total: o.total,
              clientName: o.customer.name,
              phone: o.customer.phone,
              address: o.customer.address,
              pickupDate: o.pickupDate,
              pickupTime: o.pickupTime,
              advance: o.advance,
              paymentMethod: o.paymentMethod,
              status: o.status,
              createdAt: o.createdAt,
            }))}
            onCreatePreOrder={handleCreatePreOrder}
            onMarkAsDelivered={handleMarkAsDelivered}
            onPrintOrder={handlePrintOrder}
          />
        )}

        {/* Pantalla de Corte de Caja */}
        {currentScreen === "reports" && (
          <EndOfDayScreen
            sales={sales.sales.map(s => ({
              items: s.items,
              subtotal: s.subtotal,
              iva: s.iva,
              total: s.total,
              paymentMethod: s.paymentMethod,
              cashReceived: s.cashReceived,
              timestamp: s.timestamp,
            }))}
            employeeName={session.employeeName}
            onEndShift={handleEndShift}
          />
        )}
      </MainLayout>

      {/* Modal de confirmación de cierre de sesión */}
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
