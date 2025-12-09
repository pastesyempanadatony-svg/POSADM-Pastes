import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "warning" | "info";
  title: string;
  message?: string;
  details?: Array<{ label: string; value: string }>;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  details,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const iconConfig = {
    success: {
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    info: {
      icon: Sparkles,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
  };

  const config = iconConfig[type];
  const Icon = config.icon;

  // Determine description based on what content is present
  const hasDetails = details && details.length > 0;
  const description = message || "Modal de confirmación";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-3xl p-0"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <div className="p-8 text-center">
          {/* Icon */}
          <div className={`${config.bgColor} w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center`}>
            <Icon className={`w-10 h-10 ${config.color}`} />
          </div>

          {/* Title */}
          <h2 className="text-gray-900 mb-4">{title}</h2>

          {/* Message */}
          {message && (
            <p className="text-gray-600 mb-6">
              {message}
            </p>
          )}

          {/* Details */}
          {hasDetails && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 text-left">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{detail.label}:</span>
                  <span className="text-gray-900">{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {onConfirm && (
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-12 rounded-2xl border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              className={`flex-1 h-12 rounded-2xl active:scale-95 transition-all ${
                type === "warning"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
