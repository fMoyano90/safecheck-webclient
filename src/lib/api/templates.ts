// API service para la gestión de templates (checklists)
import { getAuthToken } from '../auth';
import { Category } from '@/types';

// URL base para las peticiones a la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export interface TemplateOption {
  value: string;
  label: string;
}

export enum QuestionType {
  TEXT_INPUT = 'text_input',          // Entrada de texto corto
  TEXT_AREA = 'text_area',            // Entrada de texto largo
  NUMBER = 'number',                  // Entrada numérica
  BOOLEAN = 'boolean',                // Verdadero/Falso
  SINGLE_CHOICE = 'single_choice',    // Selección única (radio)
  MULTIPLE_CHOICE = 'multiple_choice', // Selección múltiple (checkbox)
  DATE = 'date',                      // Selector de fecha
  TIME = 'time',                      // Selector de hora
  PHOTO = 'photo',                    // Captura de foto
  SIGNATURE = 'signature',            // Firma digital
}

export interface BaseQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required?: boolean;
  instructions?: string;
}

export interface TextQuestion extends BaseQuestion {
  maxLength?: number;
  placeholder?: string;
}

export interface NumberQuestion extends BaseQuestion {
  min?: number;
  max?: number;
  unit?: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  options: TemplateOption[];
}

export interface DateTimeQuestion extends BaseQuestion {
  minDate?: string;
  maxDate?: string;
}

export interface PhotoQuestion extends BaseQuestion {
  maxPhotos?: number;
}

export type Question = 
  | TextQuestion
  | NumberQuestion
  | ChoiceQuestion
  | DateTimeQuestion
  | PhotoQuestion
  | BaseQuestion;

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface TemplateStructure {
  sections: TemplateSection[];
}

export enum TemplateType {
  ART = 'art',
  CHECKLIST = 'checklist',
}

export interface Template {
  id: number;
  name: string;
  description: string;
  type: TemplateType;
  structure: TemplateStructure;
  isActive: boolean;
  categoryId: number;
  companyId: number;
  category?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  type: TemplateType;
  structure?: TemplateStructure;
  categoryId: string;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  type?: TemplateType;
  structure?: TemplateStructure;
  categoryId?: string;
}

export interface TemplateFilters {
  categoryId?: string;
  type?: TemplateType;
  isActive?: boolean;
}

/**
 * Obtener todos los templates con filtros opcionales
 */
export async function getTemplates(filters?: TemplateFilters): Promise<Template[]> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  // Construir la URL con los parámetros de filtro
  let url = `${API_URL}/api/v1/templates`;
  const queryParams = [];
  
  if (filters) {
    if (filters.categoryId) queryParams.push(`categoryId=${filters.categoryId}`);
    if (filters.type) queryParams.push(`type=${filters.type}`);
    if (filters.isActive !== undefined) queryParams.push(`isActive=${filters.isActive}`);
  }
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al obtener templates');
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
 * Obtener un template por su ID
 */
export async function getTemplateById(id: number): Promise<Template> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/templates/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al obtener el template');
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
 * Crear un nuevo template
 */
export async function createTemplate(data: CreateTemplateData): Promise<Template> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  console.log('Payload enviado a createTemplate:', JSON.stringify(data, null, 2));
  
  const response = await fetch(`${API_URL}/api/v1/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al crear el template');
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
 * Actualizar un template existente
 */
export async function updateTemplate(id: number, data: UpdateTemplateData): Promise<Template> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/templates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al actualizar el template');
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
 * Actualizar el estado de un template (activar/desactivar)
 */
export async function updateTemplateStatus(id: number, isActive: boolean): Promise<Template> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/templates/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al actualizar el estado del template');
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
 * Eliminar un template
 */
export async function deleteTemplate(id: number): Promise<void> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/api/v1/templates/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al eliminar el template');
  }
}

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
