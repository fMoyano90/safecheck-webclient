import { getAuthToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export interface Worker {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContactPhone: string;
  position: string;
  rut: string;
  companyId: number;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  emergencyContactPhone: string;
  position: string;
  rut: string;
  companyId: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Obtener todos los trabajadores con paginación
 */
export async function getWorkers(page = 1, limit = 10): Promise<PaginatedResponse<Worker>> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  // Asegurarnos de enviar el parámetro role=trabajador y añadir isActive=true para ver solo trabajadores activos
  const response = await fetch(`${API_URL}/api/v1/users?role=trabajador&isActive=true&page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al obtener los trabajadores');
  }
  
  const responseData = await response.json();

  if (responseData && responseData.success === true && responseData.data) {
    return responseData.data as PaginatedResponse<Worker>;
  } else if (responseData && typeof responseData === 'object' && Array.isArray(responseData.data)) {
    return responseData as PaginatedResponse<Worker>;
  } else if (Array.isArray(responseData)) {
    return {
      data: responseData,
      total: responseData.length,
      page,
      limit
    };
  } else {
    return {
      data: [],
      total: 0,
      page,
      limit
    };
  }
}

/**
 * Obtener un trabajador por su ID
 */
export async function getWorkerById(id: number) {
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
    throw new Error(error.message || 'Error al obtener el trabajador');
  }
  
  return await response.json();
}

/**
 * Crear un nuevo trabajador
 */
export async function createWorker(workerData: WorkerFormData) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...workerData,
      role: 'trabajador'
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al crear el trabajador');
  }
  
  return await response.json();
}

/**
 * Actualizar un trabajador existente
 */
export async function updateWorker(id: number, workerData: WorkerFormData) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  // Eliminar la contraseña si está vacía
  const dataToSend = { ...workerData };
  if (!dataToSend.password) {
    delete dataToSend.password;
  }
  
  const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...dataToSend,
      role: 'trabajador',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al actualizar el trabajador');
  }
  
  return await response.json();
}

/**
 * Pausar un trabajador (desactivar)
 */
export async function pauseWorker(id: number) {
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
    throw new Error(error.message || 'Error al pausar el trabajador');
  }
  
  return await response.json();
}

/**
 * Reactivar un trabajador
 */
export async function reactivateWorker(id: number) {
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
    throw new Error(error.message || 'Error al reactivar el trabajador');
  }
  
  return await response.json();
}

/**
 * Función de depuración para obtener todos los usuarios sin filtros
 */
export async function getAllUsersDebug(): Promise<{success: boolean; message: string; data: Record<string, unknown>}> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/users/debug/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('Error en endpoint debug:', error);
    throw new Error(error.message || 'Error al obtener los usuarios (debug)');
  }
  
  const data = await response.json();
  
  return data;
}
