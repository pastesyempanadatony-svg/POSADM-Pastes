import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { ProductCard } from "./ProductCard";
import { CalendarIcon, Clock, Plus, Trash2, Banknote, CreditCard, QrCode } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ConfirmationModal } from "./ConfirmationModal";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface PreOrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const products: Product[] = [
  { id: "1", name: "Minero Tradicional", price: 27.0, category: "pastes" },
  { id: "2", name: "Pollo con Mole", price: 29.0, category: "pastes" },
  { id: "3", name: "Tinga de Pollo", price: 29.0, category: "pastes" },
  { id: "4", name: "Hawaiano", price: 30.0, category: "pastes" },
  { id: "9", name: "Emp. Pollo", price: 25.0, category: "empanadas" },
  { id: "10", name: "Emp. Carne", price: 25.0, category: "empanadas" },
  { id: "15", name: "Emp. Manzana", price: 22.0, category: "empanadas" },
  { id: "16", name: "Emp. Piña", price: 22.0, category: "empanadas" },
];

export function OrdersScreen() {
  const [activeTab, setActiveTab] = useState("instant");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [advancePayment, setAdvancePayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const addToPreOrder = (product: Product) => {
    setPreOrderItems((prev) => {
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

  const removeFromPreOrder = (id: string) => {
    setPreOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id: string) => {
    setPreOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setPreOrderItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSavePreOrder = () => {
    if (!clientName || !phone || !date || preOrderItems.length === 0) {
      alert("Por favor completa todos los campos");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmOrder = () => {
    // Reset form
    setClientName("");
    setPhone("");
    setDate(undefined);
    setTime("12:00");
    setPreOrderItems([]);
    setAdvancePayment("");
    setPaymentMethod("cash");
    setShowConfirmation(false);
  };

  const total = preOrderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const advance = parseFloat(advancePayment) || 0;
  const pending = total - advance;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
        <h2 className="text-gray-900">Gestión de Pedidos</h2>
        <p className="text-gray-500">Pedidos instantáneos o anticipados</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-6 pt-4">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/50">
            <TabsTrigger
              value="instant"
              className="flex-1 rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all"
            >
              Pedido Instantáneo
            </TabsTrigger>
            <TabsTrigger
              value="preorder"
              className="flex-1 rounded-xl data-[state=active]:bg-yellow-500 data-[state=active]:text-white transition-all"
            >
              Pedido Anticipado
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="instant" className="flex-1 mt-4">
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center bg-white/70 backdrop-blur-xl rounded-3xl p-12 border border-gray-200/50 max-w-md">
              <div className="bg-gradient-to-br from-red-500 to-yellow-500 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-3xl">🥟</span>
              </div>
              <h3 className="text-gray-900 mb-2">Pedidos Instantáneos</h3>
              <p className="text-gray-600 mb-6">
                Para pedidos instantáneos, usa la pantalla principal de ventas
              </p>
              <p className="text-gray-500">
                Cambiar a la pestaña "Ventas" en la navegación principal
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preorder" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6 pb-20">
              {/* Client Information */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 space-y-4">
                <h3 className="text-gray-900">Información del Cliente</h3>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Nombre del Cliente</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: 555-123-4567"
                    className="rounded-xl h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Entrega</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start rounded-xl h-12"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: es }) : "Seleccionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Hora de Entrega</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="rounded-xl h-12 pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Selection */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 space-y-4">
                <h3 className="text-gray-900">Productos del Pedido</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      price={product.price}
                      onClick={() => addToPreOrder(product)}
                    />
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              {preOrderItems.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 space-y-4">
                  <h3 className="text-gray-900">Resumen del Pedido</h3>

                  <div className="space-y-2">
                    {preOrderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 px-3 hover:bg-white/50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 active:scale-95 transition-all flex items-center justify-center"
                            >
                              <Plus className="w-3.5 h-3.5 rotate-45 text-gray-700" />
                            </button>
                            <span className="text-gray-900 min-w-[24px] text-center">
                              {item.quantity}x
                            </span>
                            <button
                              onClick={() => increaseQuantity(item.id)}
                              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 active:scale-95 transition-all flex items-center justify-center"
                            >
                              <Plus className="w-3.5 h-3.5 text-gray-700" />
                            </button>
                          </div>
                          <span className="text-gray-900">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromPreOrder(item.id)}
                            className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 active:scale-95 transition-all flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Summary Section */}
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <h4 className="text-gray-900">Resumen de Pago</h4>

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-red-600">${total.toFixed(2)}</span>
                    </div>

                    {/* Advance Payment Input */}
                    <div className="space-y-2">
                      <Label htmlFor="advancePayment">Monto de Anticipo (Opcional)</Label>
                      <Input
                        id="advancePayment"
                        type="number"
                        value={advancePayment}
                        onChange={(e) => setAdvancePayment(e.target.value)}
                        placeholder="$0.00"
                        className="rounded-xl h-12"
                        min="0"
                        max={total}
                        step="0.01"
                      />
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-2">
                      <Label>Método de Pago (Anticipo)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setPaymentMethod("cash")}
                          className={`h-16 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                            paymentMethod === "cash"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <Banknote className={`w-5 h-5 ${paymentMethod === "cash" ? "text-green-600" : "text-gray-600"}`} />
                          <span className={`text-xs ${paymentMethod === "cash" ? "text-green-700" : "text-gray-600"}`}>
                            Efectivo
                          </span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod("card")}
                          className={`h-16 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                            paymentMethod === "card"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <CreditCard className={`w-5 h-5 ${paymentMethod === "card" ? "text-blue-600" : "text-gray-600"}`} />
                          <span className={`text-xs ${paymentMethod === "card" ? "text-blue-700" : "text-gray-600"}`}>
                            Tarjeta
                          </span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod("transfer")}
                          className={`h-16 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                            paymentMethod === "transfer"
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <QrCode className={`w-5 h-5 ${paymentMethod === "transfer" ? "text-purple-600" : "text-gray-600"}`} />
                          <span className={`text-xs ${paymentMethod === "transfer" ? "text-purple-700" : "text-gray-600"}`}>
                            Transfer
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Pending Amount */}
                    {advance > 0 && (
                      <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-800">Monto Pendiente:</span>
                          <span className="text-yellow-900">${pending.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleSavePreOrder}
                      className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 active:scale-95 transition-all"
                    >
                      Guardar Pedido
                    </Button>
                  </div>
                </div>
              )}

              {/* Confirmation Modal */}
              <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                type="success"
                title="Pedido Guardado"
                details={[
                  { label: "Cliente", value: clientName },
                  { label: "Total", value: `$${total.toFixed(2)}` },
                  ...(advance > 0 ? [
                    { label: "Anticipo", value: `$${advance.toFixed(2)}` },
                    { label: "Pendiente", value: `$${pending.toFixed(2)}` }
                  ] : [])
                ]}
                confirmText="Aceptar"
                onConfirm={handleConfirmOrder}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
