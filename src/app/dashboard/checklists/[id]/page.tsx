'use client';

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { getTemplateById, updateTemplate, updateTemplateStatus, deleteTemplate, getCategories as fetchCategoriesAPI, UpdateTemplateData } from '@/lib/api/templates';

// Define API types locally based on expected structure
interface ApiQuestionOptionType {
  id?: number | string;
  label: string; // Expect 'label' from API for display text
  value: number | string; // API might send number or string for value
  // Add other properties if the API sends them
}

interface ApiQuestionType {
  id: number | string;
  text: string;
  type: string; // Keep as string initially from API, will be cast to QuestionType
  required: boolean;
  options?: ApiQuestionOptionType[];
  min?: number;
  max?: number;
  maxPhotos?: number;
  // Add other API specific question properties
}

interface ApiSectionType {
  id: number | string;
  title: string;
  description?: string;
  questions?: ApiQuestionType[];
}

interface ApiTemplateType {
  id: number;
  name: string;
  description?: string | null;
  categoryId: number | string; // API might send number or string
  isActive: boolean;
  createdAt?: string; // Added createdAt from API
  sections?: ApiSectionType[];
  structure?: {
    sections?: ApiSectionType[];
  };
  // any other fields from the API template
}

interface ApiCategoryType {
  id: number | string; // API might send number or string
  name: string;
  // any other fields from the API category
}

// Local component interfaces
interface Category {
  id: string;
  name: string;
}

interface QuestionOption {
  id?: string;
  text: string;
  value: string;
}

type QuestionType = 
  | 'text_input'
  | 'text_area'
  | 'number'
  | 'boolean'
  | 'single_choice'
  | 'multiple_choice'
  | 'date'
  | 'time'
  | 'photo'
  | 'signature';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  maxPhotos?: number;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface Checklist {
  id: number;
  name: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  createdAt?: string; // Added createdAt for local use
  sections: Section[];
}

interface ChecklistDetailPageProps {
  params: {
    id: string;
  };
}

// Mapping functions
function mapApiQuestionOptionToLocal(apiOption: ApiQuestionOptionType): QuestionOption {
  return {
    id: apiOption.id ? String(apiOption.id) : undefined,
    text: apiOption.label, // Map 'label' from API to 'text' for local use
    value: String(apiOption.value), // Ensure value is string for local use
  };
}

function mapApiQuestionToLocal(apiQuestion: ApiQuestionType): Question {
  return {
    id: String(apiQuestion.id),
    text: apiQuestion.text,
    type: apiQuestion.type as QuestionType, // Assuming API type string matches local QuestionType values
    required: apiQuestion.required,
    options: (apiQuestion.options || []).map(mapApiQuestionOptionToLocal),
    min: apiQuestion.min,
    max: apiQuestion.max,
    maxPhotos: apiQuestion.maxPhotos,
  };
}

function mapApiSectionToLocal(apiSection: ApiSectionType): Section {
  return {
    id: String(apiSection.id),
    title: apiSection.title,
    description: apiSection.description,
    questions: (apiSection.questions || []).map(mapApiQuestionToLocal),
  };
}

export default function ChecklistDetailPage({ params }: ChecklistDetailPageProps) {
  const router = useRouter();
  const { id: checklistIdString } = params;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchChecklistData = useCallback(async () => {
    try {
      setLoading(true);
      const rawData = await getTemplateById(parseInt(checklistIdString, 10)) as ApiTemplateType;
      
      let apiSections: ApiSectionType[] = [];
      if (rawData.structure && rawData.structure.sections) {
        apiSections = rawData.structure.sections;
      } else if (rawData.sections) {
        apiSections = rawData.sections;
      }

      const mappedChecklist: Checklist = {
        id: rawData.id,
        name: rawData.name,
        description: rawData.description || '',
        categoryId: String(rawData.categoryId), 
        isActive: rawData.isActive,
        createdAt: rawData.createdAt, // Map createdAt
        sections: apiSections.map(mapApiSectionToLocal),
      };
      console.log('Datos del checklist mapeados:', JSON.stringify(mappedChecklist, null, 2));
      setChecklist(mappedChecklist);
    } catch (err) {
      console.error('Error al obtener el checklist:', err);
      setError('No se pudo cargar el checklist. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [checklistIdString]);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await fetchCategoriesAPI() as ApiCategoryType[]; 
      setCategories(categoriesData.map(c => ({ id: String(c.id), name: c.name })));
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
      return;
    }

    fetchChecklistData();
    loadCategories();
  }, [router, fetchChecklistData, loadCategories]);

  const handleToggleStatus = async () => {
    if (!checklist) {
      setError('Checklist no cargado. No se puede cambiar el estado.');
      return;
    }
    try {
      setSubmitting(true);
      await updateTemplateStatus(checklist.id, !checklist.isActive);
      setChecklist(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      setSuccess(`Checklist ${checklist.isActive ? 'desactivado' : 'activado'} exitosamente`);
      setError('');
    } catch (err) {
      console.error('Error al cambiar el estado del checklist:', err);
      setError('No se pudo cambiar el estado del checklist. Por favor, intente nuevamente.');
      setSuccess('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!checklist) {
        setError('Checklist no cargado. No se puede eliminar.');
        return;
    }
    if (window.confirm('¿Está seguro que desea eliminar este checklist? Esta acción no se puede deshacer.')) {
      try {
        setSubmitting(true);
        await deleteTemplate(checklist.id);
        setSuccess('Checklist eliminado exitosamente');
        setError('');
        
        setTimeout(() => {
          router.push('/dashboard/checklists');
        }, 2000);
      } catch (err) {
        console.error('Error al eliminar el checklist:', err);
        setError('No se pudo eliminar el checklist. Por favor, intente nuevamente.');
        setSuccess('');
        setSubmitting(false); 
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChecklist(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setChecklist(prev => prev ? { ...prev, categoryId: value } : null);
  };

  const handleSave = async (event?: FormEvent) => {
    if (event) event.preventDefault();

    if (!checklist) {
      setError('Checklist no cargado. No se puede guardar.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      if (!checklist.name.trim()) {
        setError('El nombre del checklist es requerido');
        setSubmitting(false);
        return;
      }
      if (!checklist.categoryId) {
        setError('La categoría es requerida.');
        setSubmitting(false);
        return;
      }
      
      const updateData: UpdateTemplateData = {
        name: checklist.name,
        description: checklist.description,
        categoryId: checklist.categoryId,
      };
      
      await updateTemplate(checklist.id, updateData);
      
      setSuccess('Checklist actualizado exitosamente');
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar el checklist:', err);
      setError('No se pudo actualizar el checklist. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSection = (section: Section) => {
    return (
      <div key={section.id} className="mb-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {section.title}
        </h3>
        {section.description && (
          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
        )}
        
        <div className="space-y-4">
          {section.questions.map((question) => (
            <div key={question.id} className="border border-gray-200 rounded-md p-4">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {question.text}
                </span>
                {question.required && (
                  <span className="ml-2 text-xs text-red-500">*</span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mb-2">
                Tipo: {getQuestionTypeLabel(question.type)}
              </div>
              
              {renderQuestionPreview(question)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getQuestionTypeLabel = (type: QuestionType): string => {
    const labels: Record<QuestionType, string> = {
      'text_input': 'Texto Corto',
      'text_area': 'Texto Largo',
      'number': 'Número',
      'boolean': 'Verdadero/Falso',
      'single_choice': 'Selección Única',
      'multiple_choice': 'Selección Múltiple',
      'date': 'Fecha',
      'time': 'Hora',
      'photo': 'Foto',
      'signature': 'Firma',
    };
    return labels[type];
  };

  const renderQuestionPreview = (question: Question) => {
    switch (question.type) {
      case 'text_input':
        return (
          <input
            type="text"
            disabled
            placeholder="Respuesta de texto corto"
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
          />
        );
        
      case 'text_area':
        return (
          <textarea
            disabled
            rows={3}
            placeholder="Respuesta de texto largo"
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
          />
        );
        
      case 'number':
        return (
          <div>
            <input
              type="number"
              disabled
              placeholder="0"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
            {(question.min !== undefined || question.max !== undefined) && (
              <div className="mt-1 text-xs text-gray-500">
                {question.min !== undefined && question.max !== undefined
                  ? `Rango: ${question.min} - ${question.max}`
                  : question.min !== undefined
                  ? `Mínimo: ${question.min}`
                  : `Máximo: ${question.max}`}
              </div>
            )}
          </div>
        );
        
      case 'boolean':
        return (
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                disabled
                className="rounded-full border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Sí</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                disabled
                className="rounded-full border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        );
        
      case 'single_choice':
        return (
          <div className="mt-2 space-y-2">
            {(question.options && question.options.length > 0) ? (
              question.options.map((option: QuestionOption) => (
                <label key={option.value || Math.random()} className="flex items-center">
                  <input
                    type="radio"
                    disabled
                    className="rounded-full border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.text}</span>
                </label>
              ))
            ) : (
              <div className="text-sm italic text-gray-500">No hay opciones configuradas</div>
            )}
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="mt-2 space-y-2">
            {(question.options && question.options.length > 0) ? (
              question.options.map((option: QuestionOption) => (
                <label key={option.value || Math.random()} className="flex items-center">
                  <input
                    type="checkbox"
                    disabled
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.text}</span>
                </label>
              ))
            ) : (
              <div className="text-sm italic text-gray-500">No hay opciones configuradas</div>
            )}
          </div>
        );
        
      case 'date':
        return (
          <input
            type="date"
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
          />
        );
        
      case 'time':
        return (
          <input
            type="time"
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
          />
        );
        
      case 'photo':
        return (
          <div className="mt-2 p-4 border border-dashed border-gray-300 rounded-md text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-1 text-sm text-gray-500">Tomar foto</p>
            {question.maxPhotos && question.maxPhotos > 1 && (
              <p className="text-xs text-gray-500">Máximo: {question.maxPhotos} fotos</p>
            )}
          </div>
        );
        
      case 'signature':
        return (
          <div className="mt-2 p-4 border border-dashed border-gray-300 rounded-md text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <p className="mt-1 text-sm text-gray-500">Firmar aquí</p>
          </div>
        );
        
      default:
        // Exhaustive check for question types
        const exhaustiveCheck: never = question.type;
        console.warn(`Tipo de pregunta no reconocido: ${exhaustiveCheck}`);
        return <p className="text-xs text-red-500">Tipo de pregunta no soportado: {question.type}</p>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!checklist) {
    return (
      <DashboardLayout>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No se encontró el checklist solicitado.</p>
          <button
            onClick={() => router.push('/dashboard/checklists')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
          >
            Volver a Checklists
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Checklist' : 'Detalle de Checklist'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEditing 
              ? 'Modifique la información básica del checklist' 
              : 'Visualice la información y estructura del checklist'}
          </p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-primary text-white rounded-md hover:bg-opacity-90"
                disabled={submitting}
              >
                Editar
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-3 py-1 ${
                  checklist.isActive 
                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white rounded-md`}
                disabled={submitting}
              >
                {checklist.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={submitting}
              >
                Eliminar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-primary text-white rounded-md hover:bg-opacity-90"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={submitting}
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {/* Información básica */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={checklist.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            ) : (
              <div className="mt-1 text-gray-900">{checklist.name}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            {isEditing ? (
              <select
                value={checklist.categoryId}
                onChange={handleCategoryChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1 text-gray-900">
                {categories.find(c => c.id === checklist.categoryId)?.name || 'Sin categoría'}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            {isEditing ? (
              <textarea
                name="description"
                value={checklist.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            ) : (
              <div className="mt-1 text-gray-900">{checklist.description || 'Sin descripción'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <div className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                checklist.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {checklist.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de creación</label>
            <div className="mt-1 text-gray-900">
              {checklist.createdAt && new Date(checklist.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Estructura del checklist */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Estructura del Checklist</h2>
        
        {checklist.sections?.length > 0 ? (
          <div className="space-y-4">
            {checklist.sections.map((section) => renderSection(section))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Este checklist no tiene secciones definidas.</p>
            <button
              onClick={() => router.push(`/dashboard/checklists/create?clone=${checklistIdString}`)}
              className="mt-2 text-primary hover:underline"
            >
              Crear una nueva versión con secciones
            </button>
          </div>
        )}
      </div>

      {/* Botón para volver */}
      <div className="mt-6">
        <button
          onClick={() => router.push('/dashboard/checklists')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Volver a la lista
        </button>
      </div>
      {isEditing && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
          <p className="font-medium">Nota:</p>
          <p>La edición de secciones y preguntas se realiza en la página de <strong className='font-bold'>&quot;Crear/Editar Checklist&quot;</strong>. Aquí solo puedes modificar la información básica (nombre, descripción, categoría).</p>
           <button 
              onClick={() => router.push(`/dashboard/checklists/edit/${checklistIdString}`)} 
              className="mt-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150"
            >
              Ir a Editar Estructura Completa
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
