import React, { useState, useEffect } from 'react';
import { Worker, getWorkers, pauseWorker, reactivateWorker } from '@/lib/api/workers';
import WorkerForm from './WorkerForm';

export default function WorkersList() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const data = await getWorkers();
      console.log('Datos de trabajadores recibidos:', data);
      setWorkers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error al obtener trabajadores:', err);
      setError('Error al cargar los trabajadores. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleAddWorker = () => {
    setSelectedWorker(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsEditing(true);
    setShowForm(true);
  };

  const handlePauseWorker = async (id: number) => {
    try {
      await pauseWorker(id);
      fetchWorkers();
    } catch (err) {
      console.error('Error al pausar trabajador:', err);
      setError('Error al pausar el trabajador. Por favor, intenta de nuevo.');
    }
  };

  const handleReactivateWorker = async (id: number) => {
    try {
      await reactivateWorker(id);
      fetchWorkers();
    } catch (err) {
      console.error('Error al reactivar trabajador:', err);
      setError('Error al reactivar el trabajador. Por favor, intenta de nuevo.');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    fetchWorkers();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <WorkerForm
        worker={selectedWorker}
        isEditing={isEditing}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Trabajadores</h2>
        <button
          onClick={handleAddWorker}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Añadir Trabajador
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay trabajadores registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Teléfono
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cargo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
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
  );
}
