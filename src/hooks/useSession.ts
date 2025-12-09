// ============================================
// HOOK - useSession (Gestión de sesión)
// ============================================

import { useState, useCallback } from "react";
import type { IEmployee } from "../types";
import { getEmployeeById } from "../data/products";

/**
 * Hook personalizado para gestionar la sesión del usuario
 */
export function useSession() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [employee, setEmployee] = useState<IEmployee | null>(null);

    /**
     * Inicia sesión con el ID de empleado
     * @returns true si el login fue exitoso
     */
    const login = useCallback((employeeId: string): boolean => {
        const foundEmployee = getEmployeeById(employeeId);

        if (foundEmployee) {
            setEmployee(foundEmployee);
            setIsLoggedIn(true);
            return true;
        }

        return false;
    }, []);

    /**
     * Cierra sesión
     */
    const logout = useCallback(() => {
        setEmployee(null);
        setIsLoggedIn(false);
    }, []);

    /**
     * Nombre del empleado actual
     */
    const employeeName = employee?.name ?? "";

    /**
     * Verifica si el usuario es admin
     */
    const isAdmin = employee?.role === "admin";

    return {
        isLoggedIn,
        employee,
        employeeName,
        isAdmin,
        login,
        logout,
    };
}

/**
 * Tipo de retorno del hook useSession
 */
export type UseSessionReturn = ReturnType<typeof useSession>;
