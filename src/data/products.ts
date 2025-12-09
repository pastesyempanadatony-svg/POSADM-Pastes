// ============================================
// DATA - Catálogo de productos
// ============================================

import type { IProduct, ProductCategory, IEmployee } from "../types";

/**
 * Catálogo completo de productos
 */
export const products: IProduct[] = [
    // Pastes Salados
    { id: "ps-001", name: "Minero Tradicional", price: 27.0, category: "Pastes Salados" },
    { id: "ps-002", name: "Pollo con Mole", price: 29.0, category: "Pastes Salados" },
    { id: "ps-003", name: "Tinga de Pollo", price: 29.0, category: "Pastes Salados" },
    { id: "ps-004", name: "Hawaiano", price: 30.0, category: "Pastes Salados" },
    { id: "ps-005", name: "Champiñones", price: 28.0, category: "Pastes Salados" },
    { id: "ps-006", name: "Rajas con Queso", price: 28.0, category: "Pastes Salados" },
    { id: "ps-007", name: "Atún", price: 30.0, category: "Pastes Salados" },
    { id: "ps-008", name: "Picadillo", price: 27.0, category: "Pastes Salados" },

    // Empanadas Saladas
    { id: "es-001", name: "Emp. Pollo", price: 25.0, category: "Empanadas Saladas" },
    { id: "es-002", name: "Emp. Carne", price: 25.0, category: "Empanadas Saladas" },
    { id: "es-003", name: "Emp. Queso", price: 24.0, category: "Empanadas Saladas" },
    { id: "es-004", name: "Emp. Jamón y Queso", price: 26.0, category: "Empanadas Saladas" },
    { id: "es-005", name: "Emp. Rajas", price: 25.0, category: "Empanadas Saladas" },
    { id: "es-006", name: "Emp. Champiñones", price: 26.0, category: "Empanadas Saladas" },

    // Empanadas Dulces
    { id: "ed-001", name: "Emp. Manzana", price: 22.0, category: "Empanadas Dulces" },
    { id: "ed-002", name: "Emp. Piña", price: 22.0, category: "Empanadas Dulces" },
    { id: "ed-003", name: "Emp. Cajeta", price: 23.0, category: "Empanadas Dulces" },
    { id: "ed-004", name: "Emp. Chocolate", price: 24.0, category: "Empanadas Dulces" },
    { id: "ed-005", name: "Emp. Fresa", price: 22.0, category: "Empanadas Dulces" },
    { id: "ed-006", name: "Emp. Nutella", price: 26.0, category: "Empanadas Dulces" },

    // Bebidas
    { id: "bb-001", name: "Agua Natural", price: 15.0, category: "Bebidas" },
    { id: "bb-002", name: "Refresco 355ml", price: 18.0, category: "Bebidas" },
    { id: "bb-003", name: "Refresco 600ml", price: 25.0, category: "Bebidas" },
    { id: "bb-004", name: "Agua de Sabor", price: 20.0, category: "Bebidas" },
    { id: "bb-005", name: "Café Americano", price: 22.0, category: "Bebidas" },
    { id: "bb-006", name: "Jugo Natural", price: 28.0, category: "Bebidas" },

    // Promociones
    { id: "pm-001", name: "Combo 2 Pastes + Refresco", price: 70.0, category: "Promociones" },
    { id: "pm-002", name: "Combo 3 Empanadas + Bebida", price: 85.0, category: "Promociones" },
    { id: "pm-003", name: "Combo Familiar (6 Pastes)", price: 150.0, category: "Promociones" },
    { id: "pm-004", name: "Combo Dulce (4 Emp. + Café)", price: 95.0, category: "Promociones" },
];

/**
 * Lista de categorías disponibles
 */
export const categories: ProductCategory[] = [
    "Pastes Salados",
    "Empanadas Saladas",
    "Empanadas Dulces",
    "Bebidas",
    "Promociones",
];

/**
 * Obtiene productos por categoría
 */
export function getProductsByCategory(category: ProductCategory): IProduct[] {
    return products.filter((p) => p.category === category);
}

/**
 * Busca un producto por ID
 */
export function getProductById(id: string): IProduct | undefined {
    return products.find((p) => p.id === id);
}

/**
 * Empleados del sistema (mock)
 */
export const employees: IEmployee[] = [
    { id: "123456", name: "Juan Pérez", role: "cashier" },
    { id: "567890", name: "María García", role: "cashier" },
    { id: "999999", name: "Admin", role: "admin" },
];

/**
 * Busca un empleado por ID
 */
export function getEmployeeById(id: string): IEmployee | undefined {
    return employees.find((e) => e.id === id);
}
