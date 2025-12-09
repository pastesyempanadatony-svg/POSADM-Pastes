interface ProductCardProps {
  product?: {
    name: string;
    price: number;
  };
  name?: string;
  price?: number;
  onClick: () => void;
}

export function ProductCard({ product, name, price, onClick }: ProductCardProps) {
  const displayName = product?.name || name || "";
  const displayPrice = product?.price ?? price ?? 0;

  return (
    <button
      onClick={onClick}
      className="bg-white hover:bg-gray-50 active:scale-95 transition-all duration-150 rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 min-h-[120px] touch-manipulation"
    >
      <span className="text-center text-gray-900">{displayName}</span>
      <span className="text-red-600">${displayPrice.toFixed(2)}</span>
    </button>
  );
}
