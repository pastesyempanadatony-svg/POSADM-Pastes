import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { FileText, Printer, Check } from "lucide-react";

export interface Order {
  id: string;
  type: "instant" | "preorder";
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  clientName?: string;
  phone?: string;
  address?: string;
  pickupDate?: Date;
  pickupTime?: string;
  advance?: number;
  paymentMethod?: "cash" | "card" | "transfer";
  status: "pending" | "delivered";
  createdAt: Date;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onMarkAsDelivered: (orderId: string) => void;
  onPrint: (orderId: string) => void;
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onMarkAsDelivered,
  onPrint,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const pending = order.advance ? order.total - order.advance : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl w-full h-[90vh] bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-3xl p-0 flex flex-col overflow-hidden"
      >
        <DialogTitle className="sr-only">
          Detalles del Pedido {order.id}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Información completa del pedido {order.id} incluyendo productos, cliente y estado de pago
        </DialogDescription>
        
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-3 shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-gray-900">Detalles del Pedido {order.id}</h2>
                <p className="text-gray-600">
                  {order.type === "instant" ? "Pedido Instantáneo" : "Pedido Anticipado"}
                </p>
              </div>
            </div>
          </div>

          {/* Content with scroll */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4 pb-4">
              {/* Client Info */}
              {order.clientName && (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 space-y-3">
                  <h3 className="text-gray-900">Información del Cliente</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="text-gray-900">{order.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="text-gray-900">{order.phone}</span>
                    </div>
                    {order.address && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dirección:</span>
                        <span className="text-gray-900 text-right">{order.address}</span>
                      </div>
                    )}
                    {order.pickupDate && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha de Entrega:</span>
                          <span className="text-gray-900">
                            {order.pickupDate.toLocaleDateString("es-MX", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hora:</span>
                          <span className="text-gray-900">{order.pickupTime}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 space-y-3">
                <h3 className="text-gray-900">Productos</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2"
                    >
                      <div className="flex gap-3">
                        <span className="text-gray-600">{item.quantity}x</span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 space-y-3">
                <h3 className="text-gray-900">Resumen de Pago</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-gray-900">${order.total.toFixed(2)}</span>
                  </div>
                  {order.advance && order.advance > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Anticipo:</span>
                        <span className="text-green-600">
                          ${order.advance.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-gray-900">Pendiente:</span>
                        <span className="text-red-600">
                          ${pending.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                  {order.paymentMethod && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Método de Pago:</span>
                      <span className="text-gray-900">
                        {order.paymentMethod === "cash"
                          ? "Efectivo"
                          : order.paymentMethod === "card"
                          ? "Tarjeta"
                          : "Transferencia"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div
                className={`rounded-2xl p-4 ${
                  order.status === "delivered"
                    ? "bg-green-50 border border-green-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {order.status === "delivered" ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-800">Pedido Entregado</span>
                    </>
                  ) : (
                    <span className="text-yellow-800">Pedido Pendiente</span>
                  )}
                </div>
              </div>
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
              Cerrar
            </Button>
            <Button
              onClick={() => onPrint(order.id)}
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            {order.status === "pending" && (
              <Button
                onClick={() => onMarkAsDelivered(order.id)}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white rounded-2xl active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 mr-2" />
                Marcar Entregado
              </Button>
            )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
