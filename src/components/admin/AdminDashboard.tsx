// ============================================
// AdminDashboard - Placeholder para Panel Administrativo
// ============================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Users,
    Store,
    TrendingUp,
    Settings,
    LogOut,
    Menu
} from "lucide-react";
import { Button } from "../ui/button";

/**
 * Panel de administración (Placeholder)
 * Este componente será expandido para incluir:
 * - Gestión de productos
 * - Gestión de empleados
 * - Gestión de sucursales
 * - Reportes y analytics
 */
export function AdminDashboard() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("dashboard");

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "products", label: "Productos", icon: Package },
        { id: "employees", label: "Empleados", icon: Users },
        { id: "branches", label: "Sucursales", icon: Store },
        { id: "reports", label: "Reportes", icon: TrendingUp },
        { id: "settings", label: "Configuración", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-red-600">
                        Pastes Tony
                    </h1>
                    <p className="text-sm text-gray-500">Panel de Administración</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${activeSection === item.id
                                    ? "bg-red-50 text-red-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                }
              `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Button
                        onClick={() => navigate("/pos")}
                        variant="outline"
                        className="w-full rounded-xl"
                    >
                        <Menu className="w-4 h-4 mr-2" />
                        Ir al POS
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {menuItems.find(m => m.id === activeSection)?.label || "Dashboard"}
                        </h2>
                        <p className="text-gray-500">
                            Gestiona tu negocio desde aquí
                        </p>
                    </div>

                    {/* Placeholder Content */}
                    <div className="
            bg-white 
            rounded-2xl 
            border border-gray-200 
            p-12 
            text-center
          ">
                        <div className="
              w-20 h-20 
              mx-auto mb-6
              bg-gray-100 
              rounded-full 
              flex items-center justify-center
            ">
                            {(() => {
                                const Icon = menuItems.find(m => m.id === activeSection)?.icon || LayoutDashboard;
                                return <Icon className="w-10 h-10 text-gray-400" />;
                            })()}
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {activeSection === "dashboard" && "Bienvenido al Dashboard"}
                            {activeSection === "products" && "Gestión de Productos"}
                            {activeSection === "employees" && "Gestión de Empleados"}
                            {activeSection === "branches" && "Gestión de Sucursales"}
                            {activeSection === "reports" && "Reportes y Analytics"}
                            {activeSection === "settings" && "Configuración del Sistema"}
                        </h3>

                        <p className="text-gray-500 max-w-md mx-auto">
                            Esta sección está en desarrollo. Pronto podrás gestionar
                            {activeSection === "products" && " tu catálogo de productos, precios y disponibilidad."}
                            {activeSection === "employees" && " los empleados, sus PINs y permisos."}
                            {activeSection === "branches" && " las sucursales y su información."}
                            {activeSection === "reports" && " ver reportes de ventas, productos más vendidos y más."}
                            {activeSection === "settings" && " la configuración general del sistema."}
                            {activeSection === "dashboard" && " ver un resumen de tu negocio."}
                        </p>

                        <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200 max-w-md mx-auto">
                            <p className="text-sm text-yellow-800">
                                <strong>Nota:</strong> Para usar esta sección, necesitas configurar
                                Firebase Auth con login de email/password para administradores.
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats (Placeholder) */}
                    {activeSection === "dashboard" && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                            {[
                                { label: "Ventas Hoy", value: "$0.00", color: "bg-green-500" },
                                { label: "Pedidos", value: "0", color: "bg-blue-500" },
                                { label: "Productos", value: "34", color: "bg-purple-500" },
                                { label: "Empleados", value: "3", color: "bg-orange-500" },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl border border-gray-200 p-6"
                                >
                                    <div className={`
                    w-10 h-10 rounded-lg ${stat.color} 
                    flex items-center justify-center mb-4
                  `}>
                                        <span className="text-white text-lg">📊</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
