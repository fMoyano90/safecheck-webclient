'use client';

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { getTemplateById, updateTemplate, updateTemplateStatus, deleteTemplate, getCategories as fetchCategoriesAPI, UpdateTemplateData } from '@/lib/api/templates';
import { useToast } from '@/components/common/ToastContext';

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
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      showToast('Checklist no cargado. No se puede cambiar el estado.', 'error');
      return;
    }
    const originalStatus = checklist.isActive;
    try {
      setSubmitting(true);
      // Optimistic update: change UI immediately
      setChecklist(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      await updateTemplateStatus(checklist.id, !originalStatus);
      showToast(`Checklist ${!originalStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
      setError(''); // Clear previous errors
    } catch (err: unknown) {
      // Revert optimistic update on error
      setChecklist(prev => prev ? { ...prev, isActive: originalStatus } : null);
      console.error('Error al cambiar el estado del checklist:', err);
      
      let errorMessage = 'No se pudo cambiar el estado del checklist. Por favor, intente nuevamente.';
      if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: string }).message === 'string') {
        errorMessage = (err as { message: string }).message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = () => {
    if (!checklist) {
        setError('Checklist no cargado. No se puede eliminar.');
        return;
    }
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!checklist) return; // Should not happen if modal is shown correctly

    try {
      setSubmitting(true);
      await deleteTemplate(checklist.id);
      showToast('Checklist eliminado exitosamente', 'success');
      setError('');
      setShowDeleteModal(false);
      
      setTimeout(() => {
        router.push('/dashboard/checklists');
      }, 2000);
    } catch (err) {
      console.error('Error al eliminar el checklist:', err);
      setError('No se pudo eliminar el checklist. Por favor, intente nuevamente.');
      setSuccess('');
      setShowDeleteModal(false); // Close modal on error too
    } finally {
      setSubmitting(false); // Ensure submitting is reset in all cases
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
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
      
      showToast('Checklist actualizado exitosamente', 'success');
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
                disabled={submitting}
                className={`px-3 py-1 ${
                  checklist.isActive 
                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white rounded-md`}
              >
                {checklist.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={openDeleteModal} 
                disabled={submitting}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
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
              <button
                onClick={handleToggleStatus}
                disabled={submitting} // Usamos el estado 'submitting' general
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${ 
                  checklist.isActive 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting 
                  ? (checklist.isActive ? 'Activando...' : 'Desactivando...') // Texto mientras carga, basado en el estado *antes* del clic
                  : (checklist.isActive ? 'Activo (Click para desactivar)' : 'Inactivo (Click para activar)')}
              </button>
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && checklist && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="relative p-6 bg-white shadow-xl rounded-lg w-full max-w-md mx-auto transform transition-all duration-300 ease-in-out scale-100">
            <button 
              onClick={cancelDelete}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirmar Eliminación</h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Está seguro que desea eliminar el checklist <strong className="font-medium">{checklist.name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-center space-x-3 w-full">
                <button
                  onClick={cancelDelete}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-150 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 ease-in-out"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </span>
                  ) : 'Eliminar Permanentemente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
