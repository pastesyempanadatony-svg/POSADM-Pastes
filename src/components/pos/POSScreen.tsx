// ============================================
// POSScreen - Pantalla principal de ventas
// ============================================

import { useState } from "react";
import { ProductGrid } from "./ProductGrid";
import { CartSidebar } from "./CartSidebar";
import { PaymentModal } from "../PaymentModal";
import { SaveInstantOrderModal } from "../SaveInstantOrderModal";
import { ConfirmationModal } from "../ConfirmationModal";
import { products } from "../../data/products";
import type { UseCartReturn } from "../../hooks/useCart";
import type { UseSalesReturn } from "../../hooks/useSales";
import type { UseOrdersReturn } from "../../hooks/useOrders";
import type { PaymentMethod } from "../../types";

interface POSScreenProps {
    cart: UseCartReturn;
    sales: UseSalesReturn;
    orders: UseOrdersReturn;
}

/**
 * Pantalla principal del punto de venta
 * Layout responsivo: Grid + Sidebar en tablet/desktop, stacked en móvil
 */
export function POSScreen({ cart, sales, orders }: POSScreenProps) {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSaveOrderModal, setShowSaveOrderModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    /**
     * Procesa el pago y registra la venta
     */
    const handlePayment = (paymentMethod: PaymentMethod, cashReceived?: number) => {
        sales.registerSale({
            items: cart.getOrderItems(),
            subtotal: cart.subtotal,
            paymentMethod,
            cashReceived,
        });

        cart.clearCart();
        setShowPaymentModal(false);
        setSuccessMessage("¡Venta registrada exitosamente!");
        setShowSuccessModal(true);
    };

    /**
     * Guarda como pedido instantáneo
     */
    const handleSaveAsOrder = (customerData: {
        clientName: string;
        phone: string;
        address: string;
        paymentMethod: PaymentMethod;
    }) => {
        orders.createInstantOrder({
            items: cart.getOrderItems(),
            customer: {
                name: customerData.clientName,
                phone: customerData.phone,
                address: customerData.address,
            },
            paymentMethod: customerData.paymentMethod,
        });

        cart.clearCart();
        setShowSaveOrderModal(false);
        setSuccessMessage("Pedido guardado en 'Pedidos Instantáneos'");
        setShowSuccessModal(true);
    };

    return (
        <>
            <div className="
        h-full
        flex flex-col lg:flex-row
      ">
                {/* Grid de productos - Área principal */}
                <div className="
          flex-1 
          p-4 sm:p-6
          overflow-hidden
        ">
                    <ProductGrid products={products} cart={cart} />
                </div>

                {/* Sidebar del carrito - Fijo en desktop, drawer en móvil */}
                <div className="
          w-full lg:w-[380px] xl:w-[420px]
          h-[40vh] lg:h-full
          flex-shrink-0
        ">
                    <CartSidebar
                        cart={cart}
                        onCheckout={() => setShowPaymentModal(true)}
                        onSaveAsOrder={() => setShowSaveOrderModal(true)}
                    />
                </div>
            </div>

            {/* Modal de pago */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                total={cart.total}
                onConfirmPayment={handlePayment}
            />

            {/* Modal para guardar como pedido */}
            <SaveInstantOrderModal
                isOpen={showSaveOrderModal}
                onClose={() => setShowSaveOrderModal(false)}
                total={cart.total}
                onSave={handleSaveAsOrder}
            />

            {/* Modal de confirmación de éxito */}
            <ConfirmationModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                type="success"
                title="¡Listo!"
                message={successMessage}
                confirmText="Aceptar"
            />
        </>
    );
}
