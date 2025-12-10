// ============================================
// App.tsx - Punto de entrada con Routing
// Sistema POS - Pastes y Empanadas Tony
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Páginas
import { POSApp } from "./pages/POSApp";
import { FirebaseTestPage } from "./pages/FirebaseTestPage";
import { AdminDashboard } from "./components/admin";

/**
 * Componente principal con enrutamiento
 * 
 * Rutas:
 * - /pos: Sistema de punto de venta (protegido por PIN)
 * - /admin: Panel de administración (protegido por email/password)
 * - /: Redirige a /pos por defecto
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta principal - redirige al POS */}
          <Route path="/" element={<Navigate to="/pos" replace />} />

          {/* POS - Sistema de ventas */}
          <Route path="/pos/*" element={<POSApp />} />

          {/* Admin - Panel de administración */}
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* Test Firebase - Página de prueba */}
          <Route path="/test-firebase" element={<FirebaseTestPage />} />

          {/* Fallback - redirige al POS */}
          <Route path="*" element={<Navigate to="/pos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
