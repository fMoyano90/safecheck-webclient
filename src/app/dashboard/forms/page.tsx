'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { getTemplates, deleteTemplate, updateTemplateStatus, Template, TemplateType } from '@/lib/api/templates';
import { FORM_TYPES_CONFIG } from '@/types';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ToastProvider, useToast } from '@/components/common/ToastContext';

function FormsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Template[]>([]);
  const [error, setError] = useState('');
  const [filterActive, setFilterActive] = useState(true);
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const filters: { isActive: boolean; type?: TemplateType } = { isActive: filterActive };
      if (filterType !== 'all') {
        filters.type = filterType;
      }
      
      const templates = await getTemplates(filters);
      // Asegurarse de que templates sea un array
      setForms(Array.isArray(templates) ? templates : []);
      setError('');
    } catch (err) {
      console.error('Error al obtener formularios:', err);
      setError('No se pudieron cargar los formularios. Por favor, intente nuevamente.');
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [filterActive, filterType]);  

  useEffect(() => {
    // Verificar autenticación y permisos de administrador
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
      return;
    }

    fetchForms();
  }, [router, fetchForms]);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setTogglingStatusId(id);
    const originalForms = [...forms];

    // Actualización optimista de la UI
    setForms(prevForms =>
      prevForms.map(f =>
        f.id === id ? { ...f, isActive: !currentStatus } : f
      )
    );

    try {
      await updateTemplateStatus(id, !currentStatus);
      showToast(`Formulario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
      await fetchForms(); 
    } catch (err) {
      console.error('Error al cambiar el estado del formulario:', err);
      showToast('No se pudo cambiar el estado del formulario.', 'error');
      setForms(originalForms); 
    } finally {
      setTogglingStatusId(null);
    }
  };

  const openDeleteModal = (id: number) => {
    setFormToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!formToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteTemplate(formToDelete);
      fetchForms();
      showToast('Formulario eliminado correctamente', 'success');
    } catch (err) {
      console.error('Error al eliminar el formulario:', err);
      showToast('No se pudo eliminar el formulario', 'error');
      setError('No se pudo eliminar el formulario. Por favor, intente nuevamente.');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setFormToDelete(null);
    }
  };

  const getFormTypeLabel = (type: TemplateType) => {
    const config = FORM_TYPES_CONFIG.find(c => c.type === type);
    return config?.label || type;
  };

  return (
    <DashboardLayout>
      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar formulario"
        message="¿Está seguro que desea eliminar este formulario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        type="danger"
      />
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Formularios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administre los formularios de su empresa
          </p>
        </div>
        <Link 
          href="/dashboard/forms/create"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Crear Formulario
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        {/* Filtro por estado */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Estado:</span>
          <button
            onClick={() => setFilterActive(true)}
            className={`px-3 py-1 rounded-md ${
              filterActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilterActive(false)}
            className={`px-3 py-1 rounded-md ${
              !filterActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Inactivos
          </button>
        </div>

        {/* Filtro por tipo */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Tipo:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md ${
              filterType === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Todos
          </button>
          {FORM_TYPES_CONFIG.map(config => (
            <button
              key={config.type}
              onClick={() => setFilterType(config.type)}
              className={`px-3 py-1 rounded-md ${
                filterType === config.type ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : forms.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">
            No hay formularios {filterActive ? 'activos' : 'inactivos'} 
            {filterType !== 'all' ? ` de tipo ${getFormTypeLabel(filterType as TemplateType)}` : ''} disponibles.
          </p>
          {!filterActive && (
            <button
              onClick={() => setFilterActive(true)}
              className="mt-2 text-primary hover:underline"
            >
              Ver formularios activos
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategoría
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secciones
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{form.name}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate" title={form.description}>{form.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getFormTypeLabel(form.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {form.subcategory?.name || 'Sin subcategoría'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {form.structure?.sections?.length || 0} secciones
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(form.id, form.isActive)}
                      disabled={togglingStatusId === form.id}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors w-28 text-center min-w-[100px] ${
                        togglingStatusId === form.id
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : form.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50'
                      }`}
                    >
                      {togglingStatusId === form.id ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Cargando...
                        </div>
                      ) : form.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                    <Link 
                      href={`/dashboard/forms/${form.id}`} 
                      className="text-primary hover:text-indigo-700 transition-colors duration-150"
                      aria-label="Ver formulario"
                      title="Ver formulario"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => openDeleteModal(form.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-150"
                      aria-label="Eliminar formulario"
                      title="Eliminar formulario"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.223.226M5.34 5.79L4.26 19.673a2.25 2.25 0 002.244 2.077H17.5a2.25 2.25 0 002.244-2.077L18.66 5.79m-13.32 0c.636 0 1.257.078 1.848.227M5.34 5.79h13.32" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function FormsPageWithToasts() {
  return (
    <ToastProvider>
      <FormsPage />
    </ToastProvider>
  );
}
