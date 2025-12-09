import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Banknote, CreditCard, QrCode, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface SaveInstantOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    clientName: string;
    phone: string;
    address: string;
    paymentMethod: "cash" | "card" | "transfer";
    cashReceived?: number;
    isExact?: boolean;
  }) => void;
  total: number;
}

export function SaveInstantOrderModal({
  isOpen,
  onClose,
  onSave,
  total,
}: SaveInstantOrderModalProps) {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [isExact, setIsExact] = useState(true);
  const [cashReceived, setCashReceived] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleSave = () => {
    if (!clientName || !phone) {
      setAlertMessage("Por favor completa el nombre y teléfono del cliente");
      setShowAlert(true);
      return;
    }

    if (paymentMethod === "cash" && !isExact && (!cashReceived || parseFloat(cashReceived) < total)) {
      setAlertMessage("El monto recibido debe ser mayor o igual al total");
      setShowAlert(true);
      return;
    }

    onSave({
      clientName,
      phone,
      address,
      paymentMethod,
      cashReceived: paymentMethod === "cash" && !isExact ? parseFloat(cashReceived) : undefined,
      isExact: paymentMethod === "cash" ? isExact : undefined,
    });

    // Reset form
    setClientName("");
    setPhone("");
    setAddress("");
    setPaymentMethod("cash");
    setIsExact(true);
    setCashReceived("");
  };

  const change = paymentMethod === "cash" && !isExact && cashReceived 
    ? parseFloat(cashReceived) - total 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-3xl p-6">
        <DialogTitle className="sr-only">Guardar Pedido Instantáneo</DialogTitle>
        <DialogDescription className="sr-only">
          Formulario para guardar un pedido instantáneo con información del cliente y método de pago
        </DialogDescription>

        <div className="space-y-5">
          {/* Header */}
          <div>
            <h2 className="text-gray-900 mb-1">Guardar Pedido Instantáneo</h2>
            <p className="text-gray-600">Total a pagar: ${total.toFixed(2)}</p>
          </div>

          {/* Client Info */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 space-y-3">
            <h3 className="text-gray-900">Información del Cliente</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="clientName">Nombre del Cliente *</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono *</Label>
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
          </div>

          {/* Payment Method */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 space-y-3">
            <h3 className="text-gray-900">Método de Pago</h3>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === "cash"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <Banknote className={`w-6 h-6 ${paymentMethod === "cash" ? "text-green-600" : "text-gray-600"}`} />
                <span className={`text-sm ${paymentMethod === "cash" ? "text-green-600" : "text-gray-600"}`}>
                  Efectivo
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === "card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <CreditCard className={`w-6 h-6 ${paymentMethod === "card" ? "text-blue-600" : "text-gray-600"}`} />
                <span className={`text-sm ${paymentMethod === "card" ? "text-blue-600" : "text-gray-600"}`}>
                  Tarjeta
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === "transfer"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <QrCode className={`w-6 h-6 ${paymentMethod === "transfer" ? "text-purple-600" : "text-gray-600"}`} />
                <span className={`text-sm ${paymentMethod === "transfer" ? "text-purple-600" : "text-gray-600"}`}>
                  Transferencia
                </span>
              </button>
            </div>

            {/* Cash Options */}
            {paymentMethod === "cash" && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExact(true)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isExact
                        ? "border-green-500 bg-green-50 text-green-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Pago Exacto
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExact(false)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      !isExact
                        ? "border-green-500 bg-green-50 text-green-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Necesita Cambio
                  </button>
                </div>

                {!isExact && (
                  <div className="space-y-2">
                    <Label htmlFor="cashReceived">Efectivo Recibido</Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="rounded-xl h-11"
                    />
                    {cashReceived && parseFloat(cashReceived) >= total && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <p className="text-sm text-gray-600">Cambio a devolver:</p>
                        <p className="text-yellow-600">${change.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-2xl h-12 border-gray-300 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-12 active:scale-95 transition-all"
            >
              Guardar Pedido
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="max-w-sm bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-3xl p-0 overflow-hidden">
          <div className="p-6 space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-2">
              <AlertDialogTitle className="text-gray-900">
                Información incompleta
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                {alertMessage}
              </AlertDialogDescription>
            </div>

            {/* Action Button */}
            <AlertDialogAction
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-12 active:scale-95 transition-all"
              onClick={() => setShowAlert(false)}
            >
              Aceptar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
