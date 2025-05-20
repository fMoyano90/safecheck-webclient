'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { getTemplates, deleteTemplate, updateTemplateStatus, Template, TemplateType } from '@/lib/api/templates';

export default function ChecklistsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState<Template[]>([]);
  const [error, setError] = useState('');
  const [filterActive, setFilterActive] = useState(true);

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
  }, [filterActive]);  // Dependencias de fetchChecklists

  useEffect(() => {
    // Verificar autenticación y permisos de administrador
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
      return;
    }

    fetchChecklists();
  }, [router, fetchChecklists]);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await updateTemplateStatus(id, !currentStatus);
      fetchChecklists();
    } catch (err) {
      console.error('Error al cambiar el estado del checklist:', err);
      setError('No se pudo cambiar el estado del checklist. Por favor, intente nuevamente.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este checklist? Esta acción no se puede deshacer.')) {
      try {
        await deleteTemplate(id);
        fetchChecklists();
      } catch (err) {
        console.error('Error al eliminar el checklist:', err);
        setError('No se pudo eliminar el checklist. Por favor, intente nuevamente.');
      }
    }
  };

  return (
    <DashboardLayout>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      checklist.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {checklist.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/dashboard/checklists/${checklist.id}`}
                        className="text-primary hover:text-primary-dark"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(checklist.id, checklist.isActive)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {checklist.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(checklist.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
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
