'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { getTemplates, deleteTemplate, updateTemplateStatus, Template, TemplateType } from '@/lib/api/templates';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ToastProvider, useToast } from '@/components/common/ToastContext';

function ChecklistsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState<Template[]>([]);
  const [error, setError] = useState('');
  const [filterActive, setFilterActive] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchChecklists = useCallback(async () => {
    try {
      setLoading(true);
      const templates = await getTemplates({ 
        type: TemplateType.CHECKLIST,
        isActive: filterActive
      });
      // Asegurarse de que templates sea un array
      setChecklists(Array.isArray(templates) ? templates : []);
      setError('');
    } catch (err) {
      console.error('Error al obtener checklists:', err);
      setError('No se pudieron cargar los checklists. Por favor, intente nuevamente.');
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  }, [filterActive]);  

  useEffect(() => {
    // Verificar autenticación y permisos de administrador
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
      return;
    }

    fetchChecklists();
  }, [router, fetchChecklists]);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setTogglingStatusId(id);
    const originalChecklists = [...checklists];

    // Actualización optimista de la UI
    setChecklists(prevChecklists =>
      prevChecklists.map(c =>
        c.id === id ? { ...c, isActive: !currentStatus } : c
      )
    );

    try {
      await updateTemplateStatus(id, !currentStatus);
      showToast(`Checklist ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
      await fetchChecklists(); 
    } catch (err) {
      console.error('Error al cambiar el estado del checklist:', err);
      showToast('No se pudo cambiar el estado del checklist.', 'error');
      setChecklists(originalChecklists); 
    } finally {
      setTogglingStatusId(null);
    }
  };

  const openDeleteModal = (id: number) => {
    setChecklistToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!checklistToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteTemplate(checklistToDelete);
      fetchChecklists();
      showToast('Checklist eliminado correctamente', 'success');
    } catch (err) {
      console.error('Error al eliminar el checklist:', err);
      showToast('No se pudo eliminar el checklist', 'error');
      setError('No se pudo eliminar el checklist. Por favor, intente nuevamente.');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setChecklistToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar checklist"
        message="¿Está seguro que desea eliminar este checklist? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        type="danger"
      />
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Checklists</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administre los checklists de su empresa
          </p>
        </div>
        <Link 
          href="/dashboard/checklists/create"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Crear Checklist
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex items-center space-x-4">
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : checklists.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay checklists {filterActive ? 'activos' : 'inactivos'} disponibles.</p>
          {!filterActive && (
            <button
              onClick={() => setFilterActive(true)}
              className="mt-2 text-primary hover:underline"
            >
              Ver checklists activos
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
                  Categoría
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
              {checklists.map((checklist) => (
                <tr key={checklist.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{checklist.name}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate" title={checklist.description}>{checklist.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{checklist.category?.name || 'Sin categoría'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {checklist.structure?.sections?.length || 0} secciones
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(checklist.id, checklist.isActive)}
                      disabled={togglingStatusId === checklist.id}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors w-28 text-center min-w-[100px] ${
                        togglingStatusId === checklist.id
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : checklist.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50'
                      }`}
                    >
                      {togglingStatusId === checklist.id ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Cargando...
                        </div>
                      ) : checklist.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                    <Link 
                      href={`/dashboard/checklists/${checklist.id}`} 
                      className="text-primary hover:text-indigo-700 transition-colors duration-150"
                      aria-label="Ver checklist"
                      title="Ver checklist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => openDeleteModal(checklist.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-150"
                      aria-label="Eliminar checklist"
                      title="Eliminar checklist"
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

export default function ChecklistsPageWithToasts() {
  return (
    <ToastProvider>
      <ChecklistsPage />
    </ToastProvider>
  );
}
