import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { OrderItem } from "./OrderItem";
import { ShoppingCart } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { PaymentModal } from "./PaymentModal";
import { SaveInstantOrderModal } from "./SaveInstantOrderModal";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface OrderItemType {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const products: Product[] = [
  // Pastes Salados
  { id: "1", name: "Minero Tradicional", price: 27.0, category: "pastes" },
  { id: "2", name: "Pollo con Mole", price: 29.0, category: "pastes" },
  { id: "3", name: "Tinga de Pollo", price: 29.0, category: "pastes" },
  { id: "4", name: "Hawaiano", price: 30.0, category: "pastes" },
  { id: "5", name: "Champiñones", price: 28.0, category: "pastes" },
  { id: "6", name: "Rajas con Queso", price: 28.0, category: "pastes" },
  { id: "7", name: "Atún", price: 30.0, category: "pastes" },
  { id: "8", name: "Picadillo", price: 27.0, category: "pastes" },

  // Empanadas Saladas
  { id: "9", name: "Emp. Pollo", price: 25.0, category: "empanadas-saladas" },
  { id: "10", name: "Emp. Carne", price: 25.0, category: "empanadas-saladas" },
  { id: "11", name: "Emp. Queso", price: 24.0, category: "empanadas-saladas" },
  { id: "12", name: "Emp. Jamón y Queso", price: 26.0, category: "empanadas-saladas" },
  { id: "13", name: "Emp. Rajas", price: 25.0, category: "empanadas-saladas" },
  { id: "14", name: "Emp. Champiñones", price: 26.0, category: "empanadas-saladas" },

  // Empanadas Dulces
  { id: "15", name: "Emp. Manzana", price: 22.0, category: "empanadas-dulces" },
  { id: "16", name: "Emp. Piña", price: 22.0, category: "empanadas-dulces" },
  { id: "17", name: "Emp. Cajeta", price: 23.0, category: "empanadas-dulces" },
  { id: "18", name: "Emp. Chocolate", price: 24.0, category: "empanadas-dulces" },
  { id: "19", name: "Emp. Fresa", price: 22.0, category: "empanadas-dulces" },
  { id: "20", name: "Emp. Nutella", price: 26.0, category: "empanadas-dulces" },

  // Bebidas
  { id: "21", name: "Agua Natural", price: 15.0, category: "bebidas" },
  { id: "22", name: "Refresco 355ml", price: 18.0, category: "bebidas" },
  { id: "23", name: "Refresco 600ml", price: 25.0, category: "bebidas" },
  { id: "24", name: "Agua de Sabor", price: 20.0, category: "bebidas" },
  { id: "25", name: "Café Americano", price: 22.0, category: "bebidas" },
  { id: "26", name: "Jugo Natural", price: 28.0, category: "bebidas" },

  // Promociones
  { id: "27", name: "Combo 2 Pastes + Refresco", price: 70.0, category: "promociones" },
  { id: "28", name: "Combo 3 Empanadas + Bebida", price: 85.0, category: "promociones" },
  { id: "29", name: "Combo Familiar (6 Pastes)", price: 150.0, category: "promociones" },
  { id: "30", name: "Combo Dulce (4 Emp. + Café)", price: 95.0, category: "promociones" },
];

const IVA_RATE = 0.16;

interface SalesScreenProps {
  onSaleComplete: (sale: {
    items: OrderItemType[];
    subtotal: number;
    iva: number;
    total: number;
    paymentMethod: "cash" | "card" | "transfer";
    cashReceived?: number;
  }) => void;
  onSaveAsOrder: (order: {
    items: OrderItemType[];
    total: number;
    clientName: string;
    phone: string;
    address: string;
    paymentMethod: "cash" | "card" | "transfer";
    cashReceived?: number;
    isExact?: boolean;
  }) => void;
}

export function SalesScreen({ onSaleComplete, onSaveAsOrder }: SalesScreenProps) {
  const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
  const [activeCategory, setActiveCategory] = useState("pastes");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSaveOrderModalOpen, setIsSaveOrderModalOpen] = useState(false);

  const addToOrder = (product: Product) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (id: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const cancelOrder = () => {
    if (confirm("¿Estás seguro de que deseas cancelar esta venta?")) {
      setOrderItems([]);
      setIsCartOpen(false);
    }
  };

  const handlePayClick = () => {
    if (orderItems.length === 0) {
      alert("No hay productos en la comanda");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleSaveAsOrderClick = () => {
    if (orderItems.length === 0) {
      alert("No hay productos en la comanda");
      return;
    }
    setIsSaveOrderModalOpen(true);
  };

  const handleSaveAsOrder = (data: {
    clientName: string;
    phone: string;
    address: string;
    paymentMethod: "cash" | "card" | "transfer";
    cashReceived?: number;
    isExact?: boolean;
  }) => {
    onSaveAsOrder({
      items: orderItems,
      total,
      ...data,
    });
    setOrderItems([]);
    setIsCartOpen(false);
    setIsSaveOrderModalOpen(false);
  };

  const handleConfirmPayment = (method: "cash" | "card" | "transfer", cashReceived?: number) => {
    const saleData = {
      items: orderItems,
      subtotal,
      iva,
      total,
      paymentMethod: method,
      cashReceived,
    };
    onSaleComplete(saleData);
    setOrderItems([]);
    setIsCartOpen(false);
    setIsPaymentModalOpen(false);
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  const filteredProducts = products.filter(
    (product) => product.category === activeCategory
  );

  const OrderSidebar = () => (
    <div className="h-full flex flex-col bg-white/70 backdrop-blur-xl border-l border-gray-200/50 rounded-l-3xl lg:rounded-none">
      <div className="p-6 border-b border-gray-200/50">
        <h2 className="text-gray-900">Comanda</h2>
      </div>

      <ScrollArea className="flex-1 px-4">
        {orderItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
            <p>No hay productos</p>
          </div>
        ) : (
          <div className="py-2">
            {orderItems.map((item) => (
              <OrderItem
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                onIncrease={() => increaseQuantity(item.id)}
                onDecrease={() => decreaseQuantity(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-6 border-t border-gray-200/50 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>IVA (16%):</span>
            <span>${iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-900 pt-2 border-t border-gray-200">
            <span>TOTAL:</span>
            <span className="text-red-600">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handlePayClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 active:scale-95 transition-all"
            disabled={orderItems.length === 0}
          >
            PAGAR
          </Button>
          <Button
            onClick={handleSaveAsOrderClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-12 active:scale-95 transition-all"
            disabled={orderItems.length === 0}
          >
            Guardar como Pedido
          </Button>
          <Button
            onClick={cancelOrder}
            variant="outline"
            className="w-full rounded-2xl h-12 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 active:scale-95 transition-all"
            disabled={orderItems.length === 0}
          >
            Cancelar Venta
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex h-full">
        {/* Left Column - Product Selection */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="flex-1 flex flex-col"
          >
            <div className="px-6 pt-4 bg-white/50 backdrop-blur-sm">
              <TabsList className="w-full bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/50 flex-wrap h-auto">
                <TabsTrigger
                  value="pastes"
                  className="flex-1 rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all min-w-[120px]"
                >
                  Pastes Salados
                </TabsTrigger>
                <TabsTrigger
                  value="empanadas-saladas"
                  className="flex-1 rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all min-w-[120px]"
                >
                  Empanadas Saladas
                </TabsTrigger>
                <TabsTrigger
                  value="empanadas-dulces"
                  className="flex-1 rounded-xl data-[state=active]:bg-yellow-500 data-[state=active]:text-white transition-all min-w-[120px]"
                >
                  Empanadas Dulces
                </TabsTrigger>
                <TabsTrigger
                  value="bebidas"
                  className="flex-1 rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all min-w-[120px]"
                >
                  Bebidas
                </TabsTrigger>
                <TabsTrigger
                  value="promociones"
                  className="flex-1 rounded-xl data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all min-w-[120px]"
                >
                  Promociones
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeCategory} className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-full px-6 py-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-20 lg:pb-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      price={product.price}
                      onClick={() => addToOrder(product)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Order Details (Desktop Only) */}
        <div className="hidden lg:block w-[380px] xl:w-[420px]">
          <OrderSidebar />
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      {orderItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 p-4 rounded-t-3xl shadow-lg">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl h-14 active:scale-95 transition-all flex items-center justify-between px-6">
                <span>Ver Comanda</span>
                <span className="flex items-center gap-2">
                  <span className="bg-white/20 rounded-full px-3 py-1">
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                  <span>${total.toFixed(2)}</span>
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-full sm:max-w-md" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Comanda</SheetTitle>
              <OrderSidebar />
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Save Instant Order Modal */}
      <SaveInstantOrderModal
        isOpen={isSaveOrderModalOpen}
        onClose={() => setIsSaveOrderModalOpen(false)}
        total={total}
        onSave={handleSaveAsOrder}
      />
    </>
  );
}
