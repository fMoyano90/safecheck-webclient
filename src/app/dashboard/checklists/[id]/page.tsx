'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { getTemplateById, updateTemplate, updateTemplateStatus, deleteTemplate, getCategories } from '@/lib/api/templates';

export default function ChecklistDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Verificar autenticación y permisos de administrador
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
      return;
    }

    fetchChecklist();
    fetchCategories();
  }, [router, id]);

  const fetchChecklist = async () => {
    try {
      const data = await getTemplateById(parseInt(id));
      setChecklist(data);
    } catch (err) {
      console.error('Error al obtener el checklist:', err);
      setError('No se pudo cargar el checklist. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setSubmitting(true);
      await updateTemplateStatus(parseInt(id), !checklist.isActive);
      setChecklist(prev => ({ ...prev, isActive: !prev.isActive }));
      setSuccess(`Checklist ${checklist.isActive ? 'desactivado' : 'activado'} exitosamente`);
    } catch (err) {
      console.error('Error al cambiar el estado del checklist:', err);
      setError('No se pudo cambiar el estado del checklist. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Está seguro que desea eliminar este checklist? Esta acción no se puede deshacer.')) {
      try {
        setSubmitting(true);
        await deleteTemplate(parseInt(id));
        setSuccess('Checklist eliminado exitosamente');
        
        // Redireccionar después de 2 segundos
        setTimeout(() => {
          router.push('/dashboard/checklists');
        }, 2000);
      } catch (err) {
        console.error('Error al eliminar el checklist:', err);
        setError('No se pudo eliminar el checklist. Por favor, intente nuevamente.');
        setSubmitting(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChecklist(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setChecklist(prev => ({ ...prev, categoryId: value }));
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      // Validar campos requeridos
      if (!checklist.name.trim()) {
        setError('El nombre del checklist es requerido');
        setSubmitting(false);
        return;
      }
      
      // Preparar datos para enviar
      const updateData = {
        name: checklist.name,
        description: checklist.description,
        categoryId: checklist.categoryId,
      };
      
      // Enviar datos a la API
      await updateTemplate(parseInt(id), updateData);
      
      setSuccess('Checklist actualizado exitosamente');
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar el checklist:', err);
      setError('No se pudo actualizar el checklist. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Función para renderizar una sección del checklist
  const renderSection = (section, sectionIndex) => {
    return (
      <div key={section.id} className="mb-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {section.title}
        </h3>
        {section.description && (
          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
        )}
        
        <div className="space-y-4">
          {section.questions.map((question, questionIndex) => (
            <div key={question.id} className="border border-gray-200 rounded-md p-4">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {questionIndex + 1}. {question.text}
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

  // Función para obtener etiqueta legible del tipo de pregunta
  const getQuestionTypeLabel = (type) => {
    const labels = {
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
    return labels[type] || type;
  };

  // Función para renderizar una vista previa de la pregunta según su tipo
  const renderQuestionPreview = (question) => {
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
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  disabled
                  className="rounded-full border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="mt-2 space-y-2">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  disabled
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
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
            {question.maxPhotos > 1 && (
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
        return null;
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
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
              {new Date(checklist.createdAt).toLocaleDateString('es-ES', {
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
        
        {checklist.structure?.sections?.length > 0 ? (
          <div className="space-y-4">
            {checklist.structure.sections.map((section, index) => renderSection(section, index))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Este checklist no tiene secciones definidas.</p>
            <button
              onClick={() => router.push(`/dashboard/checklists/create?clone=${id}`)}
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
    </DashboardLayout>
  );
}
