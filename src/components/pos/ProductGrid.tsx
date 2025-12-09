// ============================================
// ProductGrid - Grid de productos con categorías
// ============================================

import { useState } from "react";
import type { IProduct, ProductCategory } from "../../types";
import { categories } from "../../data/products";
import { ProductCard } from "./ProductCard";
import type { UseCartReturn } from "../../hooks/useCart";

interface ProductGridProps {
    products: IProduct[];
    cart: UseCartReturn;
}

/**
 * Grid de productos con navegación por categorías
 * Diseño responsive: 2 columnas en móvil, 3 en tablet, 4 en desktop
 */
export function ProductGrid({ products, cart }: ProductGridProps) {
    const [activeCategory, setActiveCategory] = useState<ProductCategory>("Pastes Salados");

    // Filtrar productos por categoría
    const filteredProducts = products.filter((p) => p.category === activeCategory);

    return (
        <div className="flex flex-col h-full">
            {/* Tabs de categorías - Scrollable horizontal */}
            <div className="
        flex gap-2 
        overflow-x-auto 
        pb-3 mb-4
        scrollbar-hide
        -mx-1 px-1
      ">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`
              px-4 py-2.5
              rounded-xl
              whitespace-nowrap
              font-medium text-sm
              transition-all duration-200
              active:scale-95
              ${activeCategory === category
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                                : "bg-white/70 backdrop-blur-xl text-gray-700 hover:bg-white/90 border border-white/30"
                            }
            `}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Grid de productos */}
            <div className="
        flex-1 
        overflow-y-auto
        -mx-1 px-1
      ">
                <div className="
          grid 
          grid-cols-2 
          sm:grid-cols-3 
          lg:grid-cols-4 
          xl:grid-cols-5
          gap-3
          pb-4
        ">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onClick={() => cart.addItem(product)}
                            quantity={cart.getItemQuantity(product.id)}
                        />
                    ))}
                </div>

                {/* Empty state */}
                {filteredProducts.length === 0 && (
                    <div className="
            flex items-center justify-center
            h-40
            text-gray-400
            bg-white/30 backdrop-blur-xl
            rounded-2xl
            border border-white/20
          ">
                        <p>No hay productos en esta categoría</p>
                    </div>
                )}
            </div>
        </div>
    );
}
