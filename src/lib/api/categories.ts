// API service para la gestión de categorías
import { getAuthToken } from '../auth';
import { Category } from '@/types';

// URL base para las peticiones a la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

// Definir un tipo para la estructura de categoría que viene del backend
interface BackendCategory {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  created_at: string;
  color?: string;
  isActive?: boolean;
  is_active?: boolean;
  updated_at: string;
  [key: string]: string | number | boolean | undefined;
}

// Función para transformar una categoría del backend al formato del frontend
const transformCategory = (category: BackendCategory): Category => {
  // Invertimos la lógica para priorizar isActive sobre is_active
  const activeStatus = category.isActive !== undefined ? category.isActive : (category.is_active || false);
  
  return {
    ...category,
    id: String(category.id), // Convertir id a string
    is_active: activeStatus
  };
};

/**
 * Obtener todas las categorías disponibles
 */
export async function getCategories(): Promise<Category[]> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al obtener categorías');
  }
  
  const responseData = await response.json();
  
  // Manejar la estructura de respuesta del backend
  if (responseData && responseData.success && responseData.data !== undefined) {
    // Transformar cada categoría para asegurar que isActive se mapee a is_active
    return responseData.data.map(transformCategory);
  } else {
    // Si la respuesta no tiene la estructura esperada, transformar la respuesta completa
    return Array.isArray(responseData) 
      ? responseData.map(transformCategory)
      : responseData;
  }
}

/**
 * Crear una nueva categoría
 */
export async function createCategory(data: {
  name: string;
  description?: string;
  color?: string;
}): Promise<Category> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al crear la categoría');
  }
  
  const responseData = await response.json();
  
  // Manejar la estructura de respuesta del backend
  if (responseData && responseData.success && responseData.data !== undefined) {
    return transformCategory(responseData.data);
  } else {
    // Si la respuesta no tiene la estructura esperada, devolver la respuesta transformada
    return transformCategory(responseData);
  }
}

/**
 * Actualizar una categoría existente
 */
export async function updateCategory(id: number, data: {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}): Promise<Category> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  // Convertir el formato de los datos para que coincida con el backend
  const backendData = {
    name: data.name,
    description: data.description,
    color: data.color,
    isActive: data.isActive
  };
  
  try {
    const response = await fetch(`${API_URL}/api/v1/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(backendData),
    });
    
    if (!response.ok) {
      // Intentar obtener el mensaje de error del backend
      const errorData = await response.json().catch(() => ({}));
      console.error('Error de respuesta:', response.status, errorData);
      throw new Error(errorData.message || `Error al actualizar la categoría: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Transformar la respuesta del backend al formato esperado por el frontend
    if (responseData) {
      return transformCategory(responseData);
    } else {
      return responseData;
    }
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    throw error;
  }
}

/**
 * Actualizar el estado de una categoría (activar/desactivar)
 */
export async function updateCategoryStatus(id: number, isActive: boolean): Promise<Category> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  try {
    const response = await fetch(`${API_URL}/api/v1/categories/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive }), // El backend espera isActive en camelCase
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Error de respuesta:', response.status, error);
      throw new Error(error.message || `Error al ${isActive ? 'activar' : 'desactivar'} la categoría: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Transformar la respuesta del backend al formato esperado por el frontend
    if (responseData) {
      return transformCategory(responseData);
    } else {
      return responseData;
    }
  } catch (error) {
    console.error(`Error al ${isActive ? 'activar' : 'desactivar'} categoría:`, error);
    throw error;
  }
}

/**
 * Eliminar una categoría
 */
export async function deleteCategory(id: number): Promise<void> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al eliminar la categoría');
  }
}
