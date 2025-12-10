// ============================================
// ProductService - Capa de servicios para Productos
// ============================================

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    addDoc,
    query,
    where,
    orderBy,
    Timestamp,
    type DocumentData
} from "firebase/firestore";
import { db, COLLECTIONS, isFirebaseConfigured } from "../lib/firebase";
import type { IProduct, IProductInput, ProductCategory } from "../types";

// ============================================
// MOCK DATA (para desarrollo sin Firebase)
// ============================================

import { products as mockProducts } from "../data/products";

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Convierte un documento de Firestore a IProduct
 */
function docToProduct(data: DocumentData, id: string): IProduct {
    return {
        id,
        name: data.name,
        price: data.price,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable ?? true,
        createdAt: data.createdAt?.toDate?.() || new Date(),
    };
}

// ============================================
// SERVICIOS
// ============================================

/**
 * Obtiene todos los productos
 * 
 * @returns Array de productos
 */
export async function getProducts(): Promise<IProduct[]> {
    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        console.log("⚠️ Firebase no configurado, usando productos mock");
        return mockProducts.map(p => ({ ...p, isAvailable: true }));
    }

    try {
        const productsRef = collection(db, COLLECTIONS.PRODUCTS);
        const q = query(productsRef, orderBy("category"), orderBy("name"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => docToProduct(doc.data(), doc.id));
    } catch (error) {
        console.error("❌ Error obteniendo productos:", error);
        // Fallback a productos mock si hay error
        return mockProducts.map(p => ({ ...p, isAvailable: true }));
    }
}

/**
 * Obtiene productos disponibles (para el POS)
 * Consulta simplificada sin índices compuestos
 * 
 * @returns Array de productos disponibles
 */
export async function getAvailableProducts(): Promise<IProduct[]> {
    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        console.log("⚠️ Firebase no configurado, usando productos mock");
        return mockProducts.map(p => ({ ...p, isAvailable: true }));
    }

    try {
        console.log("🔥 Intentando cargar productos desde Firebase...");

        // Consulta simple sin orderBy (no requiere índices)
        const productsRef = collection(db, COLLECTIONS.PRODUCTS);
        const snapshot = await getDocs(productsRef);

        console.log(`📦 Documentos encontrados en Firebase: ${snapshot.size}`);

        if (snapshot.empty) {
            console.warn("⚠️ No hay productos en Firebase, usando mock");
            return mockProducts.map(p => ({ ...p, isAvailable: true }));
        }

        // Convertir y filtrar productos disponibles
        const products = snapshot.docs
            .map(doc => docToProduct(doc.data(), doc.id))
            .filter(p => p.isAvailable !== false);

        // Ordenar en JavaScript (por categoría, luego por nombre)
        products.sort((a, b) => {
            const categoryCompare = a.category.localeCompare(b.category);
            if (categoryCompare !== 0) return categoryCompare;
            return a.name.localeCompare(b.name);
        });

        console.log(`✅ Productos cargados desde Firebase: ${products.length}`);
        return products;
    } catch (error) {
        console.error("❌ Error obteniendo productos de Firebase:", error);
        console.log("⚠️ Usando productos mock como fallback");
        return mockProducts.map(p => ({ ...p, isAvailable: true }));
    }
}

/**
 * Obtiene productos por categoría
 * 
 * @param category - Categoría a filtrar
 * @returns Array de productos de la categoría
 */
export async function getProductsByCategory(
    category: ProductCategory
): Promise<IProduct[]> {
    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        return mockProducts
            .filter(p => p.category === category)
            .map(p => ({ ...p, isAvailable: true }));
    }

    try {
        const productsRef = collection(db, COLLECTIONS.PRODUCTS);
        const q = query(
            productsRef,
            where("category", "==", category),
            where("isAvailable", "==", true),
            orderBy("name")
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => docToProduct(doc.data(), doc.id));
    } catch (error) {
        console.error("❌ Error obteniendo productos por categoría:", error);
        return [];
    }
}

/**
 * Obtiene un producto por ID
 * 
 * @param productId - ID del producto
 * @returns El producto o null si no existe
 */
export async function getProductById(productId: string): Promise<IProduct | null> {
    // Si Firebase no está configurado, usar mock
    if (!isFirebaseConfigured()) {
        const product = mockProducts.find(p => p.id === productId);
        return product ? { ...product, isAvailable: true } : null;
    }

    try {
        const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
        const productDoc = await getDoc(productRef);

        if (!productDoc.exists()) {
            return null;
        }

        return docToProduct(productDoc.data(), productDoc.id);
    } catch (error) {
        console.error("❌ Error obteniendo producto:", error);
        return null;
    }
}

/**
 * Actualiza un producto
 * 
 * @param productId - ID del producto
 * @param updates - Campos a actualizar
 */
export async function updateProduct(
    productId: string,
    updates: Partial<IProductInput>
): Promise<void> {
    // Si Firebase no está configurado, no hacer nada
    if (!isFirebaseConfigured()) {
        console.warn("⚠️ Firebase no configurado, no se puede actualizar");
        return;
    }

    try {
        const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
        await updateDoc(productRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });
        console.log("✅ Producto actualizado:", productId);
    } catch (error) {
        console.error("❌ Error actualizando producto:", error);
        throw new Error("No se pudo actualizar el producto");
    }
}

/**
 * Crea un nuevo producto
 * 
 * @param productInput - Datos del producto
 * @returns El producto creado con su ID
 */
export async function createProduct(productInput: IProductInput): Promise<IProduct> {
    // Si Firebase no está configurado, no hacer nada
    if (!isFirebaseConfigured()) {
        throw new Error("Firebase no configurado");
    }

    try {
        const productData = {
            ...productInput,
            isAvailable: productInput.isAvailable ?? true,
            createdAt: Timestamp.now(),
        };

        const productsRef = collection(db, COLLECTIONS.PRODUCTS);
        const docRef = await addDoc(productsRef, productData);

        console.log("✅ Producto creado:", docRef.id);

        return {
            id: docRef.id,
            ...productInput,
            isAvailable: productInput.isAvailable ?? true,
            createdAt: new Date(),
        };
    } catch (error) {
        console.error("❌ Error creando producto:", error);
        throw new Error("No se pudo crear el producto");
    }
}

/**
 * Cambia la disponibilidad de un producto
 * 
 * @param productId - ID del producto
 * @param isAvailable - Nueva disponibilidad
 */
export async function toggleProductAvailability(
    productId: string,
    isAvailable: boolean
): Promise<void> {
    await updateProduct(productId, { isAvailable });
}
