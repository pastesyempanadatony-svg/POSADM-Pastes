// ============================================
// LoginScreen - Pantalla de login con estilo iOS 18
// ============================================

import { useState } from "react";
import { Delete } from "lucide-react";
import { employees } from "../data/products";
import tonyPastyLogo from "../assets/TonyPasty (720 x 720 px) (1).png";

interface LoginScreenProps {
  onLogin: (employeeName: string) => void;
}

/**
 * Pantalla de login con teclado numérico
 * Diseño glassmorphism iOS 18
 */
export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [employeeId, setEmployeeId] = useState<string>("");
  const [error, setError] = useState<string>("");

  /**
   * Maneja el click en un número del teclado
   */
  const handleNumberClick = (num: string) => {
    if (employeeId.length < 6) {
      const newId = employeeId + num;
      setEmployeeId(newId);
      setError("");

      // Auto-login cuando se ingresan 6 dígitos
      if (newId.length === 6) {
        setTimeout(() => {
          const employee = employees.find((emp) => emp.id === newId);
          if (employee) {
            onLogin(employee.id);
          } else {
            setError("ID de empleado incorrecto");
            setEmployeeId("");
          }
        }, 200);
      }
    }
  };

  /**
   * Borra el último dígito
   */
  const handleDelete = () => {
    setEmployeeId(employeeId.slice(0, -1));
    setError("");
  };

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

  return (
    <div className="
      min-h-screen 
      bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 
      flex items-center justify-center 
      p-4 sm:p-6
    ">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="
            w-24 h-24 sm:w-32 sm:h-32 
            mx-auto mb-4 sm:mb-6
          ">
            <img
              src={tonyPastyLogo}
              alt="TonyPasty Logo"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
          <h1 className="
            text-xl sm:text-2xl font-bold 
            text-gray-900 mb-2
          ">
            Pastes y Empanadas Tony
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Ingresa tu ID de empleado
          </p>
        </div>

        {/* Indicadores de dígitos */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`
                w-3 h-3 sm:w-3.5 sm:h-3.5 
                rounded-full 
                transition-all duration-200 
                ${index < employeeId.length
                  ? "bg-red-500 scale-110"
                  : "bg-gray-300"
                }
              `}
            />
          ))}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="text-center mb-4 sm:mb-6 animate-in fade-in duration-200">
            <p className="text-red-500 text-sm sm:text-base font-medium">
              {error}
            </p>
          </div>
        )}

        {/* Teclado numérico - Glassmorphism */}
        <div className="
          bg-white/60 backdrop-blur-2xl 
          rounded-3xl 
          p-4 sm:p-6 
          shadow-xl 
          border border-white/40
        ">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {numbers.map((num, index) => {
              if (num === "") {
                return <div key={index} />;
              }
              if (num === "delete") {
                return (
                  <button
                    key={index}
                    onClick={handleDelete}
                    className="
                      aspect-square 
                      rounded-2xl 
                      bg-gray-200/80 hover:bg-gray-300/80 
                      active:scale-95 
                      transition-all 
                      flex items-center justify-center
                      backdrop-blur-xl
                    "
                  >
                    <Delete className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </button>
                );
              }
              return (
                <button
                  key={index}
                  onClick={() => handleNumberClick(num)}
                  className="
                    aspect-square 
                    rounded-2xl 
                    bg-white/80 hover:bg-white/90 
                    active:scale-95 
                    transition-all 
                    shadow-sm 
                    border border-white/50 
                    flex items-center justify-center 
                    text-lg sm:text-xl font-semibold 
                    text-gray-900
                    backdrop-blur-xl
                  "
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* IDs de demo */}
        <p className="
          text-center 
          text-gray-400 
          mt-4 sm:mt-6 
          text-xs sm:text-sm
        ">
          Demo: 123456, 567890, 999999
        </p>
      </div>
    </div>
  );
}
