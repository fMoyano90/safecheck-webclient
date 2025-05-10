'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { 
  getWorkers, 
  createWorker, 
  updateWorker, 
  pauseWorker,
  reactivateWorker,
  Worker,
  WorkerFormData
} from '@/lib/api/workers';
import WorkerForm from '@/components/workers/WorkerForm';

export default function WorkersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentWorker, setCurrentWorker] = useState<Worker | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar autenticación y permisos de administrador
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
      return;
    }

    fetchWorkers();
  }, [router]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkers();
      
      // Asegurarse de que data sea un array
      if (Array.isArray(data)) {
        setWorkers(data);
      } else if (data && typeof data === 'object') {
        // Si la API devuelve un objeto con una propiedad que contiene el array
        // Por ejemplo: { items: [...], total: 10 }
        const possibleArrayProps = Object.keys(data).find(key => Array.isArray(data[key]));
        if (possibleArrayProps) {
          setWorkers(data[possibleArrayProps]);
        } else {
          console.error('La respuesta de la API no contiene un array:', data);
          setWorkers([]);
        }
      } else {
        console.error('La respuesta de la API no es un array:', data);
        setWorkers([]);
      }
    } catch (err) {
      console.error('Error al obtener trabajadores:', err);
      setError('No se pudieron cargar los trabajadores. Intente nuevamente.');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = () => {
    setCurrentWorker(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditWorker = (worker: Worker) => {
    setCurrentWorker(worker);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // Función para ver detalles del trabajador (se implementará en el futuro)
  // const handleViewWorker = (worker: Worker) => {
  //   console.log('Ver trabajador:', worker);
  // };

  const handlePauseWorker = async (workerId: number) => {
    try {
      setError(null);
      await pauseWorker(workerId);
      // Actualizar la lista de trabajadores
      fetchWorkers();
    } catch (err) {
      console.error('Error al pausar trabajador:', err);
      setError('No se pudo pausar el trabajador. Intente nuevamente.');
    }
  };

  const handleReactivateWorker = async (workerId: number) => {
    try {
      setError(null);
      await reactivateWorker(workerId);
      // Actualizar la lista de trabajadores
      fetchWorkers();
    } catch (err) {
      console.error('Error al reactivar trabajador:', err);
      setError('No se pudo reactivar el trabajador. Intente nuevamente.');
    }
  };

  const handleFormSubmit = async (workerData: WorkerFormData) => {
    try {
      setError(null);
      if (isEditing && currentWorker) {
        await updateWorker(currentWorker.id, workerData);
      } else {
        await createWorker(workerData);
      }
      setIsFormOpen(false);
      fetchWorkers();
    } catch (err) {
      console.error('Error al guardar trabajador:', err);
      setError('No se pudo guardar el trabajador. Intente nuevamente.');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Trabajadores</h1>
        <p className="text-gray-600 mb-6">Administra los trabajadores de la plataforma</p>
      
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {isFormOpen ? (
          <WorkerForm
            worker={currentWorker}
            isEditing={isEditing}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Trabajadores</h2>
              <button
                onClick={handleAddWorker}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Añadir nuevo trabajador
              </button>
            </div>

            {loading ? (
              <div className="p-6 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : workers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No hay trabajadores registrados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
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
                    {workers.map((worker) => (
                      <tr key={worker.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {worker.firstName} {worker.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{worker.rut}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{worker.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{worker.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{worker.position}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              worker.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {worker.isActive ? 'Activo' : 'Pausado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditWorker(worker)}
                            className="text-primary hover:text-primary-dark mr-4"
                          >
                            Editar
                          </button>
                          {worker.isActive ? (
                            <button
                              onClick={() => handlePauseWorker(worker.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Pausar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivateWorker(worker.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Reactivar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
