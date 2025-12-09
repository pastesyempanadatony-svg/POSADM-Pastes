// ============================================
// CartSidebar - Panel lateral del carrito (Glassmorphism)
// ============================================

import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import type { UseCartReturn } from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatting";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface CartSidebarProps {
    cart: UseCartReturn;
    onCheckout: () => void;
    onSaveAsOrder: () => void;
}

/**
 * Sidebar del carrito con estilo iOS 18 Glassmorphism
 * Diseño flotante con blur de fondo
 */
export function CartSidebar({ cart, onCheckout, onSaveAsOrder }: CartSidebarProps) {
    return (
        <div className="
      h-full
      flex flex-col
      bg-white/40 backdrop-blur-2xl
      border-l border-white/30
      shadow-2xl shadow-black/10
    ">
            {/* Header del carrito */}
            <div className="
        px-5 py-4
        border-b border-white/20
        bg-white/30
      ">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-gray-700" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Carrito
                        </h2>
                    </div>
                    {cart.itemCount > 0 && (
                        <span className="
              bg-red-500 text-white
              px-2.5 py-0.5 rounded-full
              text-sm font-medium
            ">
                            {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
                        </span>
                    )}
                </div>
            </div>

            {/* Lista de items */}
            <ScrollArea className="flex-1 px-4">
                {cart.isEmpty ? (
                    <div className="
            flex flex-col items-center justify-center
            h-full min-h-[200px]
            text-gray-400
          ">
                        <ShoppingBag className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">El carrito está vacío</p>
                        <p className="text-xs mt-1">Agrega productos para comenzar</p>
                    </div>
                ) : (
                    <div className="py-3 space-y-2">
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                className="
                  bg-white/60 backdrop-blur-xl
                  border border-white/40
                  rounded-xl
                  p-3
                  shadow-sm
                  hover:bg-white/70
                  transition-all duration-200
                "
                            >
                                <div className="flex items-start justify-between gap-2">
                                    {/* Info del producto */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="
                      text-sm font-medium text-gray-900
                      truncate
                    ">
                                            {item.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatPrice(item.price)} c/u
                                        </p>
                                    </div>

                                    {/* Precio total del item */}
                                    <p className="
                    text-sm font-semibold text-red-600
                    whitespace-nowrap
                  ">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>

                                {/* Controles de cantidad */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        {/* Botón decrementar */}
                                        <button
                                            onClick={() => cart.decrementQuantity(item.id)}
                                            disabled={item.quantity <= 1}
                                            className="
                        w-8 h-8
                        rounded-full
                        bg-gray-200/80 hover:bg-gray-300/80
                        disabled:opacity-40 disabled:cursor-not-allowed
                        flex items-center justify-center
                        transition-all duration-200
                        active:scale-90
                      "
                                        >
                                            <Minus className="w-3.5 h-3.5 text-gray-700" />
                                        </button>

                                        {/* Cantidad */}
                                        <span className="
                      w-8 text-center
                      font-semibold text-gray-900
                    ">
                                            {item.quantity}
                                        </span>

                                        {/* Botón incrementar */}
                                        <button
                                            onClick={() => cart.incrementQuantity(item.id)}
                                            className="
                        w-8 h-8
                        rounded-full
                        bg-gray-200/80 hover:bg-gray-300/80
                        flex items-center justify-center
                        transition-all duration-200
                        active:scale-90
                      "
                                        >
                                            <Plus className="w-3.5 h-3.5 text-gray-700" />
                                        </button>
                                    </div>

                                    {/* Botón eliminar */}
                                    <button
                                        onClick={() => cart.removeItem(item.id)}
                                        className="
                      w-8 h-8
                      rounded-full
                      bg-red-100/80 hover:bg-red-200/80
                      flex items-center justify-center
                      transition-all duration-200
                      active:scale-90
                    "
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Footer con totales y acciones */}
            {!cart.isEmpty && (
                <div className="
          px-5 py-4
          border-t border-white/20
          bg-white/50 backdrop-blur-xl
          space-y-4
        ">
                    {/* Desglose de totales */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">{formatPrice(cart.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">IVA (16%)</span>
                            <span className="text-gray-900">{formatPrice(cart.iva)}</span>
                        </div>
                        <div className="
              flex justify-between 
              pt-2 border-t border-gray-200/50
              font-semibold
            ">
                            <span className="text-gray-900">Total</span>
                            <span className="text-xl text-red-600">{formatPrice(cart.total)}</span>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={onSaveAsOrder}
                            variant="outline"
                            className="
                h-12 rounded-xl
                border-gray-300
                hover:bg-white/60
                active:scale-95
                transition-all
              "
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Guardar
                        </Button>
                        <Button
                            onClick={onCheckout}
                            className="
                h-12 rounded-xl
                bg-green-500 hover:bg-green-600
                text-white
                shadow-lg shadow-green-500/30
                active:scale-95
                transition-all
              "
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Cobrar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
