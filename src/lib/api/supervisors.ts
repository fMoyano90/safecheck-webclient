// API service for supervisor management
import { getAuthToken } from '../auth';

// URL base para las peticiones a la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export interface Supervisor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContactPhone?: string;
  position: string;
  rut?: string;
  isActive: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupervisorFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  emergencyContactPhone?: string;
  position?: string;
  rut?: string;
  companyId?: number;
  isActive?: boolean;
}

/**
 * Obtener todos los supervisores
 */
export async function getSupervisors(): Promise<Supervisor[]> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/users?role=supervisor`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al obtener supervisores');
  }
  
  const data = await response.json();
  
  // Log para depuración
  console.log('Respuesta de la API de supervisores:', JSON.stringify(data, null, 2));
  
  // Asegurarse de que la respuesta sea un array
  if (Array.isArray(data)) {
    console.log('La respuesta es un array con', data.length, 'elementos');
    return data;
  } else if (data && typeof data === 'object') {
    console.log('La respuesta es un objeto con propiedades:', Object.keys(data));
    // Algunos APIs devuelven { items: [...], total: X }
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        console.log('Se encontró un array en la propiedad', key, 'con', data[key].length, 'elementos');
        return data[key];
      }
    }
  }
  
  // Si no se encontró un array, devolver un array vacío
  console.warn('La respuesta de la API no contiene un array de supervisores:', data);
  return [];
}

/**
 * Obtener un supervisor por su ID
 */
export async function getSupervisorById(id: number) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al obtener el supervisor');
  }
  
  return await response.json();
}

/**
 * Crear un nuevo supervisor
 */
export async function createSupervisor(data: SupervisorFormData) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  // Asegurarse de que el rol sea supervisor
  const supervisorData = {
    ...data,
    role: 'supervisor',
  };
  
  const response = await fetch(`${API_URL}/api/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(supervisorData),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al crear el supervisor');
  }
  
  return await response.json();
}

/**
 * Actualizar un supervisor existente
 */
export async function updateSupervisor(id: number, data: SupervisorFormData) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  // Mantener el rol como supervisor
  const supervisorData = {
    ...data,
    role: 'supervisor',
  };
  
  const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(supervisorData),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al actualizar el supervisor');
  }
  
  return await response.json();
}

/**
 * Pausar (desactivar) un supervisor
 */
export async function pauseSupervisor(id: number) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive: false }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al pausar el supervisor');
  }
  
  return await response.json();
}

/**
 * Reactivar un supervisor
 */
export async function reactivateSupervisor(id: number) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive: true }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al reactivar el supervisor');
  }
  
  return await response.json();
}
