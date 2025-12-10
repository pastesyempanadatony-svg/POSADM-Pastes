// ============================================
// FIREBASE - Configuración e inicialización
// ============================================
// 
// ESTRUCTURA DE FIRESTORE:
// 
// 📁 branches (Sucursales)
// └── {branchId}
//     ├── name: string ("Lisboa 22", "Sucursal 2")
//     ├── address: string
//     ├── phone: string
//     ├── isActive: boolean
//     └── createdAt: Timestamp
//
// 📁 employees (Empleados)
// └── {employeeId}
//     ├── name: string
//     ├── pin: string (6 dígitos, encriptado idealmente)
//     ├── branchId: string (referencia a branches)
//     ├── role: "cashier" | "manager" | "admin"
//     ├── isActive: boolean
//     └── createdAt: Timestamp
//
// 📁 products (Productos/Catálogo)
// └── {productId}
//     ├── name: string
//     ├── price: number
//     ├── category: string
//     ├── description?: string
//     ├── imageUrl?: string
//     ├── isAvailable: boolean
//     └── createdAt: Timestamp
//
// 📁 sales (Ventas)
// └── {saleId}
//     ├── items: Array<{id, name, price, quantity}>
//     ├── subtotal: number
//     ├── iva: number
//     ├── total: number
//     ├── paymentMethod: "cash" | "card" | "transfer"
//     ├── cashReceived?: number
//     ├── change?: number
//     ├── employeeId: string
//     ├── employeeName: string
//     ├── branchId: string
//     └── createdAt: Timestamp
//
// 📁 orders (Pedidos anticipados)
// └── {orderId}
//     ├── orderNumber: string ("#001")
//     ├── type: "instant" | "preorder"
//     ├── items: Array<{id, name, price, quantity}>
//     ├── total: number
//     ├── customer: { name, phone, address? }
//     ├── paymentMethod: string
//     ├── status: "pending" | "preparing" | "ready" | "delivered" | "cancelled"
//     ├── pickupDate?: Timestamp
//     ├── pickupTime?: string
//     ├── advance?: number
//     ├── employeeId: string
//     ├── branchId: string
//     └── createdAt: Timestamp
//
// ============================================

import { initializeApp, type FirebaseApp } from "firebase/app";
import {
    getFirestore,
    enableIndexedDbPersistence,
    type Firestore
} from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Configuración de Firebase
 * IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
 * 
 * Para obtener estas credenciales:
 * 1. Ve a https://console.firebase.google.com
 * 2. Selecciona tu proyecto (o crea uno nuevo)
 * 3. Ve a Configuración del proyecto > General
 * 4. En "Tus apps", agrega una web app
 * 5. Copia la configuración
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAAJl0YV44YpUUuzz6iyiM5auNPLOOH5SE",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pospastes.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pospastes",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pospastes.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "326995678524",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:326995678524:web:596144f8f920ff5681ba39"
};

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Instancia de la aplicación Firebase
 */
let app: FirebaseApp;

/**
 * Instancia de Firestore
 */
let db: Firestore;

/**
 * Instancia de Firebase Auth
 */
let auth: Auth;

/**
 * Flag para saber si Firebase está inicializado
 */
let isInitialized = false;

/**
 * Inicializa Firebase con persistencia offline
 */
function initializeFirebase(): void {
    if (isInitialized) return;

    try {
        // Inicializar app
        app = initializeApp(firebaseConfig);

        // Inicializar Firestore
        db = getFirestore(app);

        // Inicializar Auth
        auth = getAuth(app);

        // Habilitar persistencia offline (IndexedDB)
        // Esto permite que el POS funcione sin conexión
        enableIndexedDbPersistence(db)
            .then(() => {
                console.log("✅ Persistencia offline habilitada");
            })
            .catch((err) => {
                if (err.code === "failed-precondition") {
                    // Múltiples pestañas abiertas
                    console.warn("⚠️ Persistencia offline no disponible: múltiples pestañas abiertas");
                } else if (err.code === "unimplemented") {
                    // El navegador no soporta las APIs necesarias
                    console.warn("⚠️ Persistencia offline no soportada en este navegador");
                } else {
                    console.error("❌ Error habilitando persistencia:", err);
                }
            });

        isInitialized = true;
        console.log("🔥 Firebase inicializado correctamente");
    } catch (error) {
        console.error("❌ Error inicializando Firebase:", error);
        throw error;
    }
}

// Inicializar automáticamente
initializeFirebase();

// ============================================
// EXPORTS
// ============================================

export { db, auth, app };

/**
 * Nombres de las colecciones (constantes para evitar typos)
 */
export const COLLECTIONS = {
    BRANCHES: "branches",
    EMPLOYEES: "employees",
    PRODUCTS: "products",
    SALES: "sales",
    ORDERS: "orders",
} as const;

/**
 * Verifica si hay conexión a Firebase
 */
export function isFirebaseConfigured(): boolean {
    return firebaseConfig.apiKey !== "TU_API_KEY" &&
        firebaseConfig.projectId !== "tu-proyecto";
}
