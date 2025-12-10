// ============================================
// AuthContext - Autenticación por PIN para POS
// ============================================

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode
} from "react";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "firebase/firestore";
import { db, COLLECTIONS, isFirebaseConfigured } from "../lib/firebase";
import type { IEmployee, IBranch, IAuthContext } from "../types";

// ============================================
// MOCK DATA (para desarrollo sin Firebase)
// ============================================

const MOCK_EMPLOYEES: IEmployee[] = [
    {
        id: "emp-001",
        name: "Juan Pérez",
        pin: "123456",
        branchId: "branch-001",
        role: "cashier",
        isActive: true,
        createdAt: new Date()
    },
    {
        id: "emp-002",
        name: "María García",
        pin: "567890",
        branchId: "branch-001",
        role: "cashier",
        isActive: true,
        createdAt: new Date()
    },
    {
        id: "emp-003",
        name: "Admin",
        pin: "999999",
        branchId: "branch-001",
        role: "admin",
        isActive: true,
        createdAt: new Date()
    },
];

const MOCK_BRANCHES: IBranch[] = [
    {
        id: "branch-001",
        name: "Lisboa 22",
        address: "Calle Lisboa #22, Centro",
        phone: "55-1234-5678",
        isActive: true,
        createdAt: new Date()
    },
    {
        id: "branch-002",
        name: "Sucursal 2",
        address: "Av. Principal #100",
        phone: "55-9876-5432",
        isActive: true,
        createdAt: new Date()
    },
];

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<IAuthContext | null>(null);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [employee, setEmployee] = useState<IEmployee | null>(null);
    const [branch, setBranch] = useState<IBranch | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Verifica si hay una sesión guardada al cargar
     */
    useEffect(() => {
        const savedSession = localStorage.getItem("pos_session");
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                setEmployee(session.employee);
                setBranch(session.branch);
                setIsAuthenticated(true);
            } catch {
                localStorage.removeItem("pos_session");
            }
        }
        setIsLoading(false);
    }, []);

    /**
     * Busca empleado por PIN en Firestore
     */
    const findEmployeeByPin = async (pin: string): Promise<IEmployee | null> => {
        // Si Firebase no está configurado, usar datos mock
        if (!isFirebaseConfigured()) {
            console.log("⚠️ Firebase no configurado, usando datos mock");
            return MOCK_EMPLOYEES.find(e => e.pin === pin && e.isActive) || null;
        }

        try {
            const employeesRef = collection(db, COLLECTIONS.EMPLOYEES);
            const q = query(
                employeesRef,
                where("pin", "==", pin),
                where("isActive", "==", true)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return null;
            }

            const docData = snapshot.docs[0];
            return {
                id: docData.id,
                ...docData.data()
            } as IEmployee;
        } catch (err) {
            console.error("Error buscando empleado:", err);
            return null;
        }
    };

    /**
     * Obtiene información de la sucursal
     * Si no encuentra por branchId, obtiene la primera sucursal disponible
     */
    const getBranch = async (branchId: string): Promise<IBranch | null> => {
        // Si Firebase no está configurado, usar datos mock
        if (!isFirebaseConfigured()) {
            return MOCK_BRANCHES.find(b => b.id === branchId) || MOCK_BRANCHES[0] || null;
        }

        try {
            // Primero intentar buscar por ID exacto
            const branchRef = doc(db, COLLECTIONS.BRANCHES, branchId);
            const branchDoc = await getDoc(branchRef);

            if (branchDoc.exists()) {
                return {
                    id: branchDoc.id,
                    ...branchDoc.data()
                } as IBranch;
            }

            // Si no existe, obtener la primera sucursal disponible
            console.warn(`⚠️ Sucursal "${branchId}" no encontrada, buscando alternativa...`);
            const branchesRef = collection(db, COLLECTIONS.BRANCHES);
            const q = query(branchesRef, where("isActive", "==", true));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const firstBranch = snapshot.docs[0];
                console.log(`✅ Usando sucursal alternativa: ${firstBranch.data().name}`);
                return {
                    id: firstBranch.id,
                    ...firstBranch.data()
                } as IBranch;
            }

            return null;
        } catch (err) {
            console.error("Error obteniendo sucursal:", err);
            return null;
        }
    };

    /**
     * Login mediante PIN numérico
     * @param pin - PIN de 6 dígitos del empleado
     * @returns true si el login fue exitoso
     */
    const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
        setError(null);
        setIsLoading(true);

        try {
            // Validar formato del PIN
            if (!/^\d{6}$/.test(pin)) {
                setError("El PIN debe ser de 6 dígitos");
                return false;
            }

            // Buscar empleado por PIN
            const foundEmployee = await findEmployeeByPin(pin);

            if (!foundEmployee) {
                setError("PIN incorrecto o empleado inactivo");
                return false;
            }

            // Obtener información de la sucursal
            const foundBranch = await getBranch(foundEmployee.branchId);

            if (!foundBranch) {
                setError("Sucursal no encontrada");
                return false;
            }

            // Establecer sesión
            setEmployee(foundEmployee);
            setBranch(foundBranch);
            setIsAuthenticated(true);

            // Guardar sesión en localStorage
            localStorage.setItem("pos_session", JSON.stringify({
                employee: foundEmployee,
                branch: foundBranch,
                loginTime: new Date().toISOString()
            }));

            console.log(`✅ Login exitoso: ${foundEmployee.name} en ${foundBranch.name}`);
            return true;
        } catch (err) {
            console.error("Error en login:", err);
            setError("Error al iniciar sesión");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Cierra la sesión
     */
    const logout = useCallback(() => {
        setEmployee(null);
        setBranch(null);
        setIsAuthenticated(false);
        setError(null);
        localStorage.removeItem("pos_session");
        console.log("👋 Sesión cerrada");
    }, []);

    const value: IAuthContext = {
        isAuthenticated,
        isLoading,
        employee,
        branch,
        loginWithPin,
        logout,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuth(): IAuthContext {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }

    return context;
}

// ============================================
// EXPORTS
// ============================================

export { AuthContext };
