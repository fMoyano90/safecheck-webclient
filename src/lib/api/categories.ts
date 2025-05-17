// API service para la gestión de categorías
import { getAuthToken } from '../auth';
import { Category } from '@/types';

// URL base para las peticiones a la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

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
    return responseData.data;
  } else {
    // Si la respuesta no tiene la estructura esperada, devolver la respuesta completa
    return responseData;
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
    return responseData.data;
  } else {
    // Si la respuesta no tiene la estructura esperada, devolver la respuesta completa
    return responseData;
  }
}

/**
 * Actualizar una categoría existente
 */
export async function updateCategory(id: number, data: {
  name?: string;
  description?: string;
  color?: string;
}): Promise<Category> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al actualizar la categoría');
  }
  
  const responseData = await response.json();
  
  if (responseData && responseData.success && responseData.data !== undefined) {
    return responseData.data;
  } else {
    return responseData;
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
  
  const response = await fetch(`${API_URL}/api/v1/categories/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ is_active: isActive }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error al ${isActive ? 'activar' : 'desactivar'} la categoría`);
  }
  
  const responseData = await response.json();
  
  if (responseData && responseData.success && responseData.data !== undefined) {
    return responseData.data;
  } else {
    return responseData;
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
