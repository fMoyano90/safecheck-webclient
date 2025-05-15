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

export async function getSupervisors(): Promise<Supervisor[]> {
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
    throw new Error(error.message || 'Error al obtener supervisores');
  }
  
  const responseData = await response.json();
  
  let allUsers = [];
  if (responseData && responseData.success && responseData.data) {
    if (Array.isArray(responseData.data)) {
      allUsers = responseData.data;
    } else if (responseData.data.data && Array.isArray(responseData.data.data)) {
      allUsers = responseData.data.data;
    }
  }
  
  interface UserWithRole {
    id: number;
    role?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    position?: string;
    isActive?: boolean;
    companyId?: number;
    rut?: string;
    emergencyContactPhone?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: string | number | boolean | undefined;
  }

  const supervisors = allUsers.filter((user: UserWithRole) => 
    user.role && user.role.toLowerCase() === 'supervisor'
  );
  
  return supervisors;
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
