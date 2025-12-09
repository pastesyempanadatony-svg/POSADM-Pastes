// ============================================
// MainLayout - Layout principal con Glassmorphism
// ============================================

import { ReactNode } from "react";
import { ShoppingCart, Package, TrendingUp, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { formatShortDate } from "../../utils/formatting";

type Screen = "sales" | "orders" | "reports";

interface MainLayoutProps {
    children: ReactNode;
    currentScreen: Screen;
    onScreenChange: (screen: Screen) => void;
    employeeName: string;
    onLogout: () => void;
    salesCount?: number;
}

/**
 * Layout principal de la aplicación con navegación
 * Diseño iOS 18 con glassmorphism
 */
export function MainLayout({
    children,
    currentScreen,
    onScreenChange,
    employeeName,
    onLogout,
    salesCount = 0,
}: MainLayoutProps) {
    const navItems = [
        {
            id: "sales" as Screen,
            label: "Ventas",
            icon: ShoppingCart,
            activeColor: "bg-red-500 hover:bg-red-600",
        },
        {
            id: "orders" as Screen,
            label: "Pedidos",
            icon: Package,
            activeColor: "bg-yellow-500 hover:bg-yellow-600",
        },
        {
            id: "reports" as Screen,
            label: "Corte de Caja",
            icon: TrendingUp,
            activeColor: "bg-green-500 hover:bg-green-600",
            badge: salesCount > 0 ? salesCount : undefined,
        },
    ];

    return (
        <div className="
      h-screen 
      bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 
      flex flex-col 
      overflow-hidden
    ">
            {/* Header con glassmorphism */}
            <header className="
        bg-white/70 backdrop-blur-xl
        border-b border-white/30
        px-4 sm:px-6 py-3 sm:py-4
        flex items-center justify-between
        flex-shrink-0
        shadow-sm
      ">
                <div>
                    <h1 className="
            text-lg sm:text-xl font-bold 
            text-red-600
          ">
                        Pastes y Empanadas Tony
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {employeeName} • {formatShortDate(new Date())}
                    </p>
                </div>

                <Button
                    onClick={onLogout}
                    variant="outline"
                    size="sm"
                    className="
            rounded-xl
            border-gray-300
            hover:bg-red-50 hover:text-red-600 hover:border-red-300
            active:scale-95
            transition-all
          "
                >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                </Button>
            </header>

            {/* Navegación */}
            <nav className="
        bg-white/40 backdrop-blur-xl
        border-b border-white/20
        px-4 sm:px-6 py-2
        flex gap-2
        flex-shrink-0
        overflow-x-auto
        scrollbar-hide
      ">
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        onClick={() => onScreenChange(item.id)}
                        variant={currentScreen === item.id ? "default" : "ghost"}
                        className={`
              rounded-xl h-10 sm:h-11
              active:scale-95 
              transition-all
              whitespace-nowrap
              ${currentScreen === item.id
                                ? `${item.activeColor} text-white shadow-lg`
                                : "hover:bg-white/60"
                            }
            `}
                    >
                        <item.icon className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">{item.label}</span>
                        {item.badge !== undefined && (
                            <span className="
                ml-1.5 sm:ml-2
                bg-white/20 
                rounded-full 
                px-2 py-0.5 
                text-xs font-medium
              ">
                                {item.badge}
                            </span>
                        )}
                    </Button>
                ))}
            </nav>

            {/* Contenido principal */}
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
