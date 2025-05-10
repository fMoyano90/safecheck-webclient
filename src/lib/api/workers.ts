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

/**
 * Obtener todos los trabajadores
 */
export async function getWorkers() {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/users?role=worker`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al obtener los trabajadores');
  }
  
  const data = await response.json();
  
  // Asegurarse de que siempre devolvemos un array
  if (Array.isArray(data)) {
    return data;
  } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
    return data.data;
  } else {
    console.log('Formato de respuesta inesperado:', data);
    return [];
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
