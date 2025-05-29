// Interfaces compartidas para toda la aplicación

import { QuestionType, TemplateType } from "@/lib/api/templates";

// Subcategorías que pertenecen a un tipo de formulario
export interface Subcategory {
  id: string;
  company_id: number;
  name: string;
  description?: string;
  created_at: string;
  color?: string;
  is_active: boolean;
  updated_at: string;
  form_type: TemplateType; // Tipo de formulario al que pertenece esta subcategoría
  [key: string]: string | number | boolean | TemplateType | undefined;
}

// Para compatibilidad con código existente, usamos alias
export type Category = Subcategory;

export interface Option {
  value: string;
  label: string;
  [key: string]: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: Option[];
  min?: number;
  max?: number;
  [key: string]: string | boolean | QuestionType | Option[] | number | undefined;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  [key: string]: string | Question[] | undefined;
}

export interface FormData {
  name: string;
  description: string;
  subcategoryId: string | number; // Cambiado de categoryId a subcategoryId
  type: TemplateType;
}

// Tipos de formularios con sus subcategorías predefinidas
export interface FormTypeConfig {
  type: TemplateType;
  label: string;
  description: string;
  icon: string;
  defaultSubcategories: string[];
}

export const FORM_TYPES_CONFIG: FormTypeConfig[] = [
  {
    type: TemplateType.CHECKLIST,
    label: 'Checklist',
    description: 'Listas de verificación para equipos y procesos',
    icon: 'clipboard-list',
    defaultSubcategories: ['Camionetas', 'Grúas', 'Equipos de Seguridad', 'Herramientas']
  },
  {
    type: TemplateType.ART,
    label: 'ART',
    description: 'Análisis de Riesgo en el Trabajo',
    icon: 'shield-exclamation',
    defaultSubcategories: ['Trabajos en Altura', 'Espacios Confinados', 'Soldadura', 'Excavaciones']
  },
  {
    type: TemplateType.REPORTE,
    label: 'Reporte',
    description: 'Reportes de incidentes y observaciones',
    icon: 'document-report',
    defaultSubcategories: ['Incidente', 'Accidente', 'Tarjeta por la Vida', 'Observación de Seguridad']
  },
  {
    type: TemplateType.ACTIVIDADES,
    label: 'Actividades',
    description: 'Registro de actividades y tareas',
    icon: 'calendar-days',
    defaultSubcategories: ['Capacitación', 'Inspección', 'Mantenimiento', 'Operación']
  }
];
