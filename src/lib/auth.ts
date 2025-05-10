// Funciones de autenticación para el cliente web de SafeCheck

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

// URL base para las peticiones a la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

/**
 * Función para iniciar sesión
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const data: AuthResponse = await response.json();
    
    // Verificar si el usuario tiene rol de administrador
    if (data.user.role !== 'admin') {
      throw new Error('Acceso denegado. Se requieren permisos de administrador.');
    }
    
    // Guardar datos de sesión en localStorage
    localStorage.setItem('authToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Error de autenticación:', error);
    throw error;
  }
}

/**
 * Función para cerrar sesión
 */
export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Función para verificar si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
}

/**
 * Función para obtener el token de autenticación
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Función para obtener el usuario actual
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error al parsear datos del usuario:', error);
    return null;
  }
}

/**
 * Función para verificar si el usuario tiene rol de administrador
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}
