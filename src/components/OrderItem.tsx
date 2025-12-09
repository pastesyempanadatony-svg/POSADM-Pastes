import { Plus, Minus, Trash2 } from "lucide-react";

interface OrderItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function OrderItem({
  name,
  price,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}: OrderItemProps) {
  const total = price * quantity;

  return (
    <div className="flex items-center justify-between py-3 px-2 hover:bg-white/20 rounded-xl transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrease}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Disminuir cantidad"
          >
            {quantity === 1 ? (
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-gray-700" />
            )}
          </button>
          <span className="text-gray-900 min-w-[24px] text-center">{quantity}x</span>
          <button
            onClick={onIncrease}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Aumentar cantidad"
          >
            <Plus className="w-3.5 h-3.5 text-gray-700" />
          </button>
        </div>
        <span className="text-gray-900">{name}</span>
      </div>
      <span className="text-gray-900">${total.toFixed(2)}</span>
    </div>
  );
}
