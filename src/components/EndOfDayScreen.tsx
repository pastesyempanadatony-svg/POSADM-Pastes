import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { DollarSign, CreditCard, Banknote, ShoppingBag, TrendingUp, Printer, QrCode } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";

interface Sale {
  items: any[];
  subtotal: number;
  iva: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer";
  cashReceived?: number;
  timestamp: Date;
}

interface EndOfDayScreenProps {
  sales: Sale[];
  employeeName: string;
  onEndShift: () => void;
}

export function EndOfDayScreen({ sales, employeeName, onEndShift }: EndOfDayScreenProps) {
  const [showEndShiftConfirm, setShowEndShiftConfirm] = useState(false);
  const [showShiftEnded, setShowShiftEnded] = useState(false);
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalCash = sales
    .filter((sale) => sale.paymentMethod === "cash")
    .reduce((sum, sale) => sum + sale.total, 0);
  const totalCard = sales
    .filter((sale) => sale.paymentMethod === "card")
    .reduce((sum, sale) => sum + sale.total, 0);
  const totalTransfer = sales
    .filter((sale) => sale.paymentMethod === "transfer")
    .reduce((sum, sale) => sum + sale.total, 0);
  const numberOfSales = sales.length;

  const averageTicket = numberOfSales > 0 ? totalSales / numberOfSales : 0;

  const handlePrint = () => {
    alert("Imprimiendo reporte...");
  };

  const handleEndShiftClick = () => {
    setShowEndShiftConfirm(true);
  };

  const handleConfirmEndShift = () => {
    setShowEndShiftConfirm(false);
    setShowShiftEnded(true);
  };

  const handleShiftEndedClose = () => {
    setShowShiftEnded(false);
    onEndShift();
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6 max-w-6xl mx-auto pb-20">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 text-center">
          <div className="bg-gradient-to-br from-red-500 to-yellow-500 w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-gray-900 mb-2">Corte del Día</h2>
          <p className="text-gray-600">Resumen de ventas - {employeeName}</p>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Sales */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg rounded-3xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/80 mb-1">Total Ventas</p>
            <p className="text-3xl">${totalSales.toFixed(2)}</p>
          </Card>

          {/* Cash */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg rounded-3xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <Banknote className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/80 mb-1">Total Efectivo</p>
            <p className="text-3xl">${totalCash.toFixed(2)}</p>
          </Card>

          {/* Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none shadow-lg rounded-3xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/80 mb-1">Total Tarjeta</p>
            <p className="text-3xl">${totalCard.toFixed(2)}</p>
          </Card>

          {/* Transfer */}
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-none shadow-lg rounded-3xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <QrCode className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/80 mb-1">Total Transferencia</p>
            <p className="text-3xl">${totalTransfer.toFixed(2)}</p>
          </Card>

          {/* Number of Sales */}
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-none shadow-lg rounded-3xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/80 mb-1">Número de Ventas</p>
            <p className="text-3xl">{numberOfSales}</p>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6">
            <h3 className="text-gray-900 mb-4">Desglose por Método de Pago</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 rounded-xl p-2">
                    <Banknote className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600">Efectivo</p>
                    <p className="text-gray-900">
                      {sales.filter((s) => s.paymentMethod === "cash").length} ventas
                    </p>
                  </div>
                </div>
                <p className="text-gray-900">${totalCash.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 rounded-xl p-2">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600">Tarjeta</p>
                    <p className="text-gray-900">
                      {sales.filter((s) => s.paymentMethod === "card").length} ventas
                    </p>
                  </div>
                </div>
                <p className="text-gray-900">${totalCard.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500 rounded-xl p-2">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600">Transferencia</p>
                    <p className="text-gray-900">
                      {sales.filter((s) => s.paymentMethod === "transfer").length} ventas
                    </p>
                  </div>
                </div>
                <p className="text-gray-900">${totalTransfer.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6">
            <h3 className="text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-600">Ticket Promedio</span>
                <span className="text-gray-900">${averageTicket.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-600">Primera Venta</span>
                <span className="text-gray-900">
                  {sales.length > 0
                    ? sales[0].timestamp.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-600">Última Venta</span>
                <span className="text-gray-900">
                  {sales.length > 0
                    ? sales[sales.length - 1].timestamp.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-14 rounded-2xl border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
          >
            <Printer className="w-5 h-5 mr-2" />
            Imprimir Reporte
          </Button>

          <Button
            onClick={handleEndShiftClick}
            className="h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl active:scale-95 transition-all"
          >
            Cerrar Turno
          </Button>
        </div>

        {/* Footer Note */}
        <Card className="bg-yellow-50 border-yellow-200 rounded-2xl p-4">
          <p className="text-yellow-800 text-center">
            💡 Recuerda contar el efectivo en caja antes de cerrar el turno
          </p>
        </Card>
      </div>

      {/* End Shift Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEndShiftConfirm}
        onClose={() => setShowEndShiftConfirm(false)}
        type="warning"
        title="¿Estás seguro de que deseas cerrar tu turno?"
        message="Esta acción es irreversible y te llevará al inicio de sesión."
        confirmText="Confirmar Cierre"
        cancelText="Cancelar"
        onConfirm={handleConfirmEndShift}
      />

      {/* Shift Ended Modal */}
      <ConfirmationModal
        isOpen={showShiftEnded}
        onClose={handleShiftEndedClose}
        type="success"
        title="Turno cerrado. ¡Hasta pronto!"
        confirmText="Aceptar"
      />
    </div>
  );
}
