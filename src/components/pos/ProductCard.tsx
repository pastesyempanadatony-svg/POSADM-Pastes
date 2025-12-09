// ============================================
// ProductCard - Card de producto con estilo iOS 18
// ============================================

import type { IProduct } from "../../types";
import { formatPrice } from "../../utils/formatting";

interface ProductCardProps {
    product: IProduct;
    onClick: () => void;
    quantity?: number;
}

/**
 * Card de producto con diseño glassmorphism iOS 18
 */
export function ProductCard({ product, onClick, quantity }: ProductCardProps) {
    return (
        <button
            onClick={onClick}
            className="
        relative
        bg-white/70 backdrop-blur-xl
        border border-white/30
        rounded-2xl p-4
        shadow-lg shadow-black/5
        hover:bg-white/80 hover:shadow-xl hover:scale-[1.02]
        active:scale-[0.98]
        transition-all duration-200 ease-out
        text-left
        group
      "
        >
            {/* Badge de cantidad */}
            {quantity && quantity > 0 && (
                <div className="
          absolute -top-2 -right-2
          w-6 h-6
          bg-red-500 text-white
          rounded-full
          flex items-center justify-center
          text-xs font-bold
          shadow-lg
          animate-in zoom-in duration-200
        ">
                    {quantity}
                </div>
            )}

            {/* Nombre del producto */}
            <h3 className="
        text-gray-900 font-medium
        text-sm leading-tight
        mb-2
        group-hover:text-gray-800
        transition-colors
      ">
                {product.name}
            </h3>

            {/* Precio */}
            <p className="
        text-red-600 font-semibold
        text-lg
      ">
                {formatPrice(product.price)}
            </p>
        </button>
    );
}
