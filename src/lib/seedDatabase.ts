// ============================================
// Script para poblar Firestore con datos iniciales
// Ejecutar desde la consola del navegador
// ============================================

import {
    collection,
    addDoc,
    getDocs,
    Timestamp,
    writeBatch,
    doc
} from "firebase/firestore";
import { db, COLLECTIONS, isFirebaseConfigured } from "./firebase";

/**
 * Datos iniciales de sucursales
 */
const INITIAL_BRANCHES = [
    {
        name: "Pastes y Empanadas Tony",
        address: "Calle Lisboa 22, Juárez, Cuauhtémoc, 06600 Ciudad de México, CDMX",
        phone: "55 2676 6580",
        isActive: true,
    },
    {
        name: "Pastes y Empanadas Toni",
        address: "Dr. Jimenez 101-C, Doctores, Cuauhtémoc, 06720 Ciudad de México, CDMX",
        phone: "55 2676 6580",
        isActive: true,
    },
];

/**
 * Datos iniciales de empleados
 */
const INITIAL_EMPLOYEES = [
    {
        name: "Edith",
        pin: "123456",
        role: "cashier",
        isActive: true,
    },
    {
        name: "Daniel",
        pin: "567890",
        role: "cashier",
        isActive: true,
    },
    {
        name: "Administrador",
        pin: "999999",
        role: "admin",
        isActive: true,
    },
];

/**
 * Datos iniciales de productos
 */
const INITIAL_PRODUCTS = [
    // Pastes Salados
    { name: "Minero Tradicional", price: 24.0, category: "Pastes Salados", isAvailable: true },
    { name: "Papa Atún", price: 24.0, category: "Pastes Salados", isAvailable: true },
    { name: "Frijoles con Chorizo", price: 24.0, category: "Pastes Salados", isAvailable: true },
    { name: "Frijoles con Queso", price: 24.0, category: "Pastes Salados", isAvailable: true },

    // Empanadas Saladas
    { name: "Emp. Salchicha", price: 24.0, category: "Empanadas Saladas", isAvailable: true },
    { name: "Emp. Choriqueso", price: 24.0, category: "Empanadas Saladas", isAvailable: true },
    { name: "Emp. Rajas", price: 24.0, category: "Empanadas Saladas", isAvailable: true },
    { name: "Emp. Champiñones", price: 24.0, category: "Empanadas Saladas", isAvailable: true },
    { name: "Emp. Hawaiano", price: 24.0, category: "Empanadas Saladas", isAvailable: true },
    { name: "Emp. Tinga", price: 24.0, category: "Empanadas Saladas", isAvailable: true },
    { name: "Emp. Mole Rojo", price: 24.0, category: "Empanadas Saladas", isAvailable: true },
    { name: "Emp. Mole Verde", price: 24.0, category: "Empanadas Saladas", isAvailable: true },

    // Empanadas Dulces
    { name: "Emp. Manzana", price: 24.0, category: "Empanadas Dulces", isAvailable: true },
    { name: "Emp. Piña", price: 24.0, category: "Empanadas Dulces", isAvailable: true },
    { name: "Emp. Cajeta", price: 24.0, category: "Empanadas Dulces", isAvailable: true },
    { name: "Emp. Piña con queso", price: 24.0, category: "Empanadas Dulces", isAvailable: true },
    { name: "Emp. Guayaba", price: 24.0, category: "Empanadas Dulces", isAvailable: true },
    { name: "Emp. Nutella", price: 24.0, category: "Empanadas Dulces", isAvailable: true },
    { name: "Emp. Mango", price: 24.0, category: "Empanadas Dulces", isAvailable: true },
    { name: "Emp. Zarzamora", price: 24.0, category: "Empanadas Dulces", isAvailable: true },
    { name: "Emp. Arroz con leche", price: 24.0, category: "Empanadas Dulces", isAvailable: true },

    // Bebidas
    { name: "Agua Natural", price: 15.0, category: "Bebidas", isAvailable: true },
    { name: "Refresco 355ml", price: 24.0, category: "Bebidas", isAvailable: true },
    { name: "Refresco 600ml", price: 25.0, category: "Bebidas", isAvailable: true },
    { name: "Boing", price: 24.0, category: "Bebidas", isAvailable: true },
    { name: "Café chico", price: 15.0, category: "Bebidas", isAvailable: true },
    { name: "Cafe grande", price: 28.0, category: "Bebidas", isAvailable: true },

    // Promociones
    { name: "Combo 2 Pastes + Refresco", price: 65.0, category: "Promociones", isAvailable: true },
    { name: "Combo 3 Empanadas + Bebida", price: 85.0, category: "Promociones", isAvailable: true },
];

/**
 * Verifica si ya existen datos en una colección
 */
async function collectionHasData(collectionName: string): Promise<boolean> {
    const snapshot = await getDocs(collection(db, collectionName));
    return !snapshot.empty;
}

/**
 * Pobla Firestore con datos iniciales
 */
export async function seedDatabase(): Promise<{
    success: boolean;
    message: string;
    details: string[];
}> {
    const details: string[] = [];

    if (!isFirebaseConfigured()) {
        return {
            success: false,
            message: "Firebase no está configurado",
            details: ["Verifica que el archivo .env.local tenga las credenciales correctas"],
        };
    }

    try {
        // ========================================
        // CREAR SUCURSALES
        // ========================================
        if (await collectionHasData(COLLECTIONS.BRANCHES)) {
            details.push("⏭️ Sucursales: ya existen datos, saltando...");
        } else {
            const branchIds: string[] = [];
            for (const branch of INITIAL_BRANCHES) {
                const docRef = await addDoc(collection(db, COLLECTIONS.BRANCHES), {
                    ...branch,
                    createdAt: Timestamp.now(),
                });
                branchIds.push(docRef.id);
                details.push(`✅ Sucursal creada: ${branch.name} (${docRef.id})`);
            }

            // ========================================
            // CREAR EMPLEADOS (necesitan branchId)
            // ========================================
            for (const employee of INITIAL_EMPLOYEES) {
                const docRef = await addDoc(collection(db, COLLECTIONS.EMPLOYEES), {
                    ...employee,
                    branchId: branchIds[0], // Asignar a la primera sucursal
                    createdAt: Timestamp.now(),
                });
                details.push(`✅ Empleado creado: ${employee.name} (PIN: ${employee.pin})`);
            }
        }

        // ========================================
        // CREAR PRODUCTOS
        // ========================================
        if (await collectionHasData(COLLECTIONS.PRODUCTS)) {
            details.push("⏭️ Productos: ya existen datos, saltando...");
        } else {
            const batch = writeBatch(db);

            for (const product of INITIAL_PRODUCTS) {
                const docRef = doc(collection(db, COLLECTIONS.PRODUCTS));
                batch.set(docRef, {
                    ...product,
                    createdAt: Timestamp.now(),
                });
            }

            await batch.commit();
            details.push(`✅ ${INITIAL_PRODUCTS.length} productos creados`);
        }

        return {
            success: true,
            message: "Base de datos poblada exitosamente",
            details,
        };
    } catch (error) {
        console.error("Error poblando base de datos:", error);
        return {
            success: false,
            message: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
            details,
        };
    }
}

/**
 * Verifica la conexión a Firebase y muestra el estado
 */
export async function testFirebaseConnection(): Promise<{
    connected: boolean;
    configured: boolean;
    collections: Record<string, number>;
}> {
    const result = {
        connected: false,
        configured: isFirebaseConfigured(),
        collections: {} as Record<string, number>,
    };

    if (!result.configured) {
        console.warn("⚠️ Firebase no está configurado con credenciales reales");
        return result;
    }

    try {
        // Intentar leer cada colección
        for (const [key, name] of Object.entries(COLLECTIONS)) {
            const snapshot = await getDocs(collection(db, name));
            result.collections[name] = snapshot.size;
        }

        result.connected = true;
        console.log("✅ Conexión a Firebase exitosa");
        console.table(result.collections);

        return result;
    } catch (error) {
        console.error("❌ Error conectando a Firebase:", error);
        return result;
    }
}

// Exportar para uso en consola
if (typeof window !== "undefined") {
    (window as any).seedDatabase = seedDatabase;
    (window as any).testFirebaseConnection = testFirebaseConnection;
}
