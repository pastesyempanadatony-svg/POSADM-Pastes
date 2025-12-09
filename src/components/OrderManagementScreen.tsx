import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Plus, Clock, User, DollarSign, Package } from "lucide-react";
import { Order, OrderDetailsModal } from "./OrderDetailsModal";
import { CreatePreOrderModal } from "./CreatePreOrderModal";
import { ConfirmationModal } from "./ConfirmationModal";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface OrderManagementScreenProps {
  products: Product[];
  instantOrders: Order[];
  preOrders: Order[];
  onCreatePreOrder: (orderData: {
    clientName: string;
    phone: string;
    address: string;
    date: Date;
    time: string;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
    advance: number;
    paymentMethod: "cash" | "card" | "transfer";
  }) => void;
  onMarkAsDelivered: (orderId: string) => void;
  onPrintOrder: (orderId: string) => void;
}

export function OrderManagementScreen({
  products,
  instantOrders,
  preOrders,
  onCreatePreOrder,
  onMarkAsDelivered,
  onPrintOrder,
}: OrderManagementScreenProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCreatePreOrder, setShowCreatePreOrder] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);

  const handleCreatePreOrder = (orderData: any) => {
    onCreatePreOrder(orderData);
    setLastCreatedOrder(orderData);
    setShowCreatePreOrder(false);
    setShowConfirmation(true);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleMarkAsDelivered = (orderId: string) => {
    onMarkAsDelivered(orderId);
    setShowOrderDetails(false);
  };

  const handlePrint = (orderId: string) => {
    onPrintOrder(orderId);
  };

  const pendingInstantOrders = instantOrders.filter((o) => o.status === "pending");
  const pendingPreOrders = preOrders.filter((o) => o.status === "pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Gestión de Pedidos</h1>
            <p className="text-gray-600">
              Administra pedidos instantáneos y anticipados
            </p>
          </div>
          <Button
            onClick={() => setShowCreatePreOrder(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-12 px-6 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Pedido Anticipado
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="instant" className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-xl p-1 rounded-2xl border border-gray-200/50">
            <TabsTrigger
              value="instant"
              className="rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white px-6"
            >
              <Package className="w-4 h-4 mr-2" />
              Pedidos Instantáneos ({pendingInstantOrders.length})
            </TabsTrigger>
            <TabsTrigger
              value="preorder"
              className="rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white px-6"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pedidos Anticipados ({pendingPreOrders.length})
            </TabsTrigger>
          </TabsList>

          {/* Instant Orders Tab */}
          <TabsContent value="instant">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingInstantOrders.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 text-center border-gray-200/50">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-gray-900 mb-2">No hay pedidos instantáneos</h3>
                      <p className="text-gray-600">
                        Los pedidos guardados desde la pantalla de ventas aparecerán aquí
                      </p>
                    </Card>
                  </div>
                ) : (
                  pendingInstantOrders.map((order) => (
                    <Card
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-gray-200/50 cursor-pointer hover:bg-white/90 transition-all active:scale-95"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-gray-900">Pedido {order.id}</h3>
                          <div className="bg-yellow-100 px-3 py-1 rounded-full">
                            <span className="text-xs text-yellow-800">Pendiente</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Package className="w-4 h-4" />
                            <span className="text-sm">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                              productos
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {order.createdAt.toLocaleTimeString("es-MX", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="text-red-600">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Pre-orders Tab */}
          <TabsContent value="preorder">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPreOrders.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 text-center border-gray-200/50">
                      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-gray-900 mb-2">No hay pedidos anticipados</h3>
                      <p className="text-gray-600">
                        Crea un nuevo pedido anticipado usando el botón superior
                      </p>
                    </Card>
                  </div>
                ) : (
                  pendingPreOrders.map((order) => (
                    <Card
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-gray-200/50 cursor-pointer hover:bg-white/90 transition-all active:scale-95"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-gray-900">Pedido {order.id}</h3>
                          <div className="bg-yellow-100 px-3 py-1 rounded-full">
                            <span className="text-xs text-yellow-800">Pendiente</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="text-sm">{order.clientName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {order.pickupDate?.toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "short",
                              })}{" "}
                              {order.pickupTime}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="text-gray-900">${order.total.toFixed(2)}</span>
                          </div>
                          {order.advance && order.advance > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Pendiente:</span>
                              <span className="text-red-600">
                                ${(order.total - order.advance).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        order={selectedOrder}
        onMarkAsDelivered={handleMarkAsDelivered}
        onPrint={handlePrint}
      />

      {/* Create Pre-Order Modal */}
      <CreatePreOrderModal
        isOpen={showCreatePreOrder}
        onClose={() => setShowCreatePreOrder(false)}
        products={products}
        onSave={handleCreatePreOrder}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        type="success"
        title="Pedido Guardado"
        details={
          lastCreatedOrder
            ? [
                { label: "Cliente", value: lastCreatedOrder.clientName },
                { label: "Total", value: `$${lastCreatedOrder.total.toFixed(2)}` },
                ...(lastCreatedOrder.advance > 0
                  ? [
                      { label: "Anticipo", value: `$${lastCreatedOrder.advance.toFixed(2)}` },
                      {
                        label: "Pendiente",
                        value: `$${(lastCreatedOrder.total - lastCreatedOrder.advance).toFixed(2)}`,
                      },
                    ]
                  : []),
              ]
            : []
        }
        confirmText="Aceptar"
      />
    </div>
  );
}
