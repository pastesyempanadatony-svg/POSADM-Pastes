import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { CreditCard, Banknote, Delete, QrCode } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirmPayment: (method: "cash" | "card" | "transfer", cashReceived?: number) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  total,
  onConfirmPayment,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | null>(null);
  const [cashReceived, setCashReceived] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<{
    method: "cash" | "card" | "transfer";
    total: number;
    change?: number;
  } | null>(null);

  const handleNumberClick = (num: string) => {
    setCashReceived((prev) => prev + num);
  };

  const handleDelete = () => {
    setCashReceived((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCashReceived("");
  };

  const handleExactAmount = () => {
    setCashReceived(total.toFixed(2));
  };

  const handleQuickAmount = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const receivedAmount = parseFloat(cashReceived) || 0;
  const change = receivedAmount - total;
  const canConfirm =
    paymentMethod === "card" || 
    paymentMethod === "transfer" || 
    (paymentMethod === "cash" && receivedAmount >= total);

  const handleConfirm = () => {
    if (canConfirm) {
      // Show success modal
      setCompletedSale({
        method: paymentMethod!,
        total,
        change: paymentMethod === "cash" ? change : undefined,
      });
      setShowSuccessModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Complete the payment
    if (completedSale) {
      onConfirmPayment(
        completedSale.method,
        completedSale.method === "cash" ? receivedAmount : undefined
      );
    }
    // Reset state
    setPaymentMethod(null);
    setCashReceived("");
    setCompletedSale(null);
  };

  const handleModalClose = () => {
    setPaymentMethod(null);
    setCashReceived("");
    onClose();
  };

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "delete"];

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md w-full h-[95vh] bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-3xl p-0 flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">Pago</DialogTitle>
        <DialogDescription className="sr-only">
          Proceso de pago para completar la transacción
        </DialogDescription>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Total */}
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-1">Total a Pagar</p>
            <p className="text-red-600">${total.toFixed(2)}</p>
          </div>

          {/* Payment Method Selection */}
          {!paymentMethod && (
            <div className="space-y-3">
              <p className="text-gray-700 text-center mb-2">Selecciona método de pago</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => setPaymentMethod("cash")}
                  className="h-24 bg-green-500 hover:bg-green-600 text-white rounded-2xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Banknote className="w-7 h-7" />
                  <span className="text-sm">Efectivo</span>
                </Button>
                <Button
                  onClick={() => setPaymentMethod("card")}
                  className="h-24 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <CreditCard className="w-7 h-7" />
                  <span className="text-sm">Tarjeta</span>
                </Button>
                <Button
                  onClick={() => setPaymentMethod("transfer")}
                  className="h-24 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <QrCode className="w-7 h-7" />
                  <span className="text-sm">Transferencia</span>
                </Button>
              </div>
            </div>
          )}

          {/* Cash Payment */}
          {paymentMethod === "cash" && (
            <div className="space-y-3">
              <Button
                onClick={() => setPaymentMethod(null)}
                variant="outline"
                className="w-full rounded-2xl h-9 text-sm"
              >
                ← Cambiar método de pago
              </Button>

              {/* Amount Display */}
              <div className="bg-gray-100 rounded-2xl p-3 text-center">
                <p className="text-gray-600 text-sm mb-0.5">Monto Recibido</p>
                <p className="text-gray-900">${cashReceived || "0.00"}</p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                <Button
                  onClick={handleExactAmount}
                  variant="outline"
                  className="rounded-xl h-8 text-xs"
                >
                  Exacto
                </Button>
                <Button
                  onClick={() => handleQuickAmount(100)}
                  variant="outline"
                  className="rounded-xl h-8 text-xs"
                >
                  $100
                </Button>
                <Button
                  onClick={() => handleQuickAmount(200)}
                  variant="outline"
                  className="rounded-xl h-8 text-xs"
                >
                  $200
                </Button>
                <Button
                  onClick={() => handleQuickAmount(500)}
                  variant="outline"
                  className="rounded-xl h-8 text-xs"
                >
                  $500
                </Button>
              </div>

              {/* Keypad */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2.5 border border-gray-200">
                <div className="grid grid-cols-3 gap-1.5">
                  {numbers.map((num, index) => {
                    if (num === "delete") {
                      return (
                        <button
                          key={index}
                          onClick={handleDelete}
                          className="aspect-square rounded-xl bg-gray-200 hover:bg-gray-300 active:scale-95 transition-all flex items-center justify-center"
                        >
                          <Delete className="w-4 h-4 text-gray-700" />
                        </button>
                      );
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => handleNumberClick(num)}
                        className="aspect-square rounded-xl bg-white hover:bg-gray-50 active:scale-95 transition-all shadow-sm border border-gray-200 flex items-center justify-center text-gray-900"
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Change Display */}
              {receivedAmount > 0 && (
                <div className={`rounded-2xl p-2 text-center ${
                  change >= 0 ? "bg-green-100" : "bg-red-100"
                }`}>
                  <p className={`text-sm ${change >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {change >= 0 ? "Cambio" : "Falta"}: ${Math.abs(change).toFixed(2)}
                  </p>
                </div>
              )}

              <Button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="w-full h-11 bg-green-500 hover:bg-green-600 text-white rounded-2xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Venta
              </Button>
            </div>
          )}

          {/* Card Payment */}
          {paymentMethod === "card" && (
            <div className="space-y-3">
              <Button
                onClick={() => setPaymentMethod(null)}
                variant="outline"
                className="w-full rounded-2xl h-9 text-sm"
              >
                ← Cambiar método de pago
              </Button>

              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <CreditCard className="w-14 h-14 mx-auto mb-3 text-blue-600" />
                <p className="text-gray-700 mb-1">Procesar en terminal externa</p>
                <p className="text-gray-500 text-sm">Espera confirmación del pago</p>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full h-11 bg-green-500 hover:bg-green-600 text-white rounded-2xl active:scale-95 transition-all"
              >
                Confirmar Venta
              </Button>
            </div>
          )}

          {/* Transfer Payment */}
          {paymentMethod === "transfer" && (
            <div className="space-y-3">
              <Button
                onClick={() => setPaymentMethod(null)}
                variant="outline"
                className="w-full rounded-2xl h-9 text-sm"
              >
                ← Cambiar método de pago
              </Button>

              <div className="bg-purple-50 rounded-2xl p-6 text-center">
                <QrCode className="w-14 h-14 mx-auto mb-3 text-purple-600" />
                <p className="text-gray-700 mb-1">Mostrar QR al cliente</p>
                <p className="text-gray-500 text-sm">Espera confirmación de la transferencia</p>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full h-11 bg-green-500 hover:bg-green-600 text-white rounded-2xl active:scale-95 transition-all"
              >
                Confirmar Venta
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        type="success"
        title="Venta Completada con Éxito"
        details={
          completedSale
            ? [
                { label: "Total", value: `$${completedSale.total.toFixed(2)}` },
                ...(completedSale.change !== undefined && completedSale.change > 0
                  ? [{ label: "Cambio", value: `$${completedSale.change.toFixed(2)}` }]
                  : []),
              ]
            : []
        }
        confirmText="Aceptar"
      />
    </Dialog>
  );
}
