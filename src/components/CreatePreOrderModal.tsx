import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ProductCard } from "./ProductCard";
import { CalendarIcon, Clock, Plus, Trash2, Banknote, CreditCard, QrCode } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface PreOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreatePreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSave: (order: {
    clientName: string;
    phone: string;
    address: string;
    date: Date;
    time: string;
    items: PreOrderItem[];
    total: number;
    advance: number;
    paymentMethod: "cash" | "card" | "transfer";
  }) => void;
}

export function CreatePreOrderModal({
  isOpen,
  onClose,
  products,
  onSave,
}: CreatePreOrderModalProps) {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [advancePayment, setAdvancePayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [activeCategory, setActiveCategory] = useState("Pastes Salados");

  const categories = [
    "Pastes Salados",
    "Empanadas Saladas",
    "Empanadas Dulces",
    "Bebidas",
    "Promociones",
  ];

  const filteredProducts = (products || []).filter(
    (p) => p && p.category === activeCategory
  );

  const addToPreOrder = (product: Product) => {
    const existing = preOrderItems.find((item) => item.id === product.id);
    if (existing) {
      setPreOrderItems(
        preOrderItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setPreOrderItems([
        ...preOrderItems,
        { ...product, quantity: 1 },
      ]);
    }
  };

  const removeFromPreOrder = (itemId: string) => {
    setPreOrderItems(preOrderItems.filter((item) => item.id !== itemId));
  };

  const increaseQuantity = (itemId: string) => {
    setPreOrderItems(
      preOrderItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (itemId: string) => {
    setPreOrderItems(
      preOrderItems.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleSave = () => {
    if (!clientName || !phone || !date || preOrderItems.length === 0) {
      alert("Por favor completa todos los campos");
      return;
    }

    const total = preOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const advance = parseFloat(advancePayment) || 0;

    onSave({
      clientName,
      phone,
      address,
      date,
      time,
      items: preOrderItems,
      total,
      advance,
      paymentMethod,
    });

    // Reset form
    setClientName("");
    setPhone("");
    setAddress("");
    setDate(undefined);
    setTime("12:00");
    setPreOrderItems([]);
    setAdvancePayment("");
    setPaymentMethod("cash");
  };

  const total = preOrderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const advance = parseFloat(advancePayment) || 0;
  const pending = total - advance;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-full h-[90vh] bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-3xl p-0 flex flex-col overflow-hidden"
      >
        <DialogTitle className="sr-only">Nuevo Pedido Anticipado</DialogTitle>
        <DialogDescription className="sr-only">
          Formulario para crear un nuevo pedido anticipado con información del cliente, selección de productos y pago
        </DialogDescription>
        
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-6 pt-6 pb-3 shrink-0">
            <h2 className="text-gray-900">Nuevo Pedido Anticipado</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4 pb-4">
              {/* Client Information */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 space-y-3">
                <h3 className="text-gray-900">Información del Cliente</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="clientName">Nombre del Cliente</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Juan Pérez"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Número de Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="5512345678"
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Dirección de Entrega</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle Falsa 123, Col. Centro"
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Fecha de Entrega</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left h-11 rounded-xl"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-2xl">
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

                  <div className="space-y-1.5">
                    <Label htmlFor="time">Hora de Entrega</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="rounded-xl h-11 pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 space-y-3">
                <h3 className="text-gray-900">Seleccionar Productos</h3>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all active:scale-95 ${
                        activeCategory === category
                          ? "bg-red-500 text-white"
                          : "bg-white hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => addToPreOrder(product)}
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-gray-500 py-8">
                      No hay productos en esta categoría
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              {preOrderItems.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 space-y-3">
                  <h3 className="text-gray-900">Resumen del Pedido</h3>

                  <div className="space-y-1.5">
                    {preOrderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 px-3 hover:bg-white/50 rounded-xl transition-colors"
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
                  <div className="pt-3 border-t border-gray-200 space-y-3">
                    <h4 className="text-gray-900">Resumen de Pago</h4>

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-red-600">${total.toFixed(2)}</span>
                    </div>

                    {/* Advance Payment Input */}
                    <div className="space-y-1.5">
                      <Label htmlFor="advancePayment">Monto de Anticipo (Opcional)</Label>
                      <Input
                        id="advancePayment"
                        type="number"
                        value={advancePayment}
                        onChange={(e) => setAdvancePayment(e.target.value)}
                        placeholder="$0.00"
                        className="rounded-xl h-11"
                        min="0"
                        max={total}
                        step="0.01"
                      />
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-1.5">
                      <Label>Método de Pago (Anticipo)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setPaymentMethod("cash")}
                          className={`h-14 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
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
                          className={`h-14 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
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
                          className={`h-14 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
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
                      <div className="bg-yellow-50 rounded-2xl p-3 border border-yellow-200">
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-800">Monto Pendiente:</span>
                          <span className="text-yellow-900">${pending.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 shrink-0">
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-12 rounded-2xl border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!clientName || !phone || !date || preOrderItems.length === 0}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white rounded-2xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Pedido
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
