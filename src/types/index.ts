// Interfaces compartidas para toda la aplicación

import { QuestionType, TemplateType } from "@/lib/api/templates";

export interface Category {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  created_at: string;
  color?: string;
  is_active: boolean;
  updated_at: string;
  [key: string]: string | number | boolean | undefined;
}

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
  categoryId: string | number;
  type: TemplateType;
}
