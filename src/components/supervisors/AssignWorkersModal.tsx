'use client';

import React, { useEffect, useState } from 'react';
import { Supervisor } from '@/lib/api/supervisors';
import { Worker, getWorkers } from '@/lib/api/workers';

interface AssignWorkersModalProps {
  supervisor: Supervisor | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (supervisorId: number, workerId: number) => Promise<void>;
}

export default function AssignWorkersModal({
  supervisor,
  isOpen,
  onClose,
  onAssign,
}: AssignWorkersModalProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assigningWorker, setAssigningWorker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadWorkers();
    }
  }, [isOpen]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWorkers();
      setWorkers(response.data || []);
    } catch (err) {
      console.error('Error al cargar trabajadores:', err);
      setError('No se pudieron cargar los trabajadores. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!supervisor || !selectedWorkerId) {
      setError('Por favor, selecciona un trabajador para asignar');
      return;
    }

    try {
      setAssigningWorker(true);
      setError(null);
      setSuccess(null);
      
      await onAssign(supervisor.id, selectedWorkerId);
      
      setSuccess('Trabajador asignado correctamente');
      setSelectedWorkerId(null);
    } catch (err: unknown) {
      console.error('Error al asignar trabajador:', err);
      setError(
        err instanceof Error ? err.message : 'Error al asignar el trabajador. Por favor, intenta de nuevo.'
      );
    } finally {
      setAssigningWorker(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="border-b p-4 bg-primary">
          <h2 className="text-xl font-semibold text-white">
            Asignar Trabajadores a {supervisor?.firstName} {supervisor?.lastName}
          </h2>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-t-primary border-r-primary border-b-primary border-l-transparent"></div>
              <p className="mt-2">Cargando trabajadores...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="worker" className="block text-sm font-medium text-gray-900 mb-1">
                  Seleccionar Trabajador
                </label>
                <select
                  id="worker"
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-900 font-medium bg-white"
                  value={selectedWorkerId || ''}
                  onChange={(e) => setSelectedWorkerId(Number(e.target.value) || null)}
                >
                  <option value="" className="text-gray-500">Seleccionar un trabajador</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id} className="text-gray-900 font-medium">
                      {worker.firstName} {worker.lastName} ({worker.email})
                    </option>
                  ))}
                </select>
                
                {workers.length === 0 && !loading && (
                  <p className="mt-2 text-sm text-gray-700">
                    No hay trabajadores disponibles para asignar.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-t p-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-800 hover:bg-gray-100 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedWorkerId || assigningWorker}
            className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-medium ${
              !selectedWorkerId || assigningWorker
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {assigningWorker ? (
              <>
                <span className="inline-block align-middle animate-spin h-4 w-4 mr-2 border-2 border-t-white border-r-white border-b-white border-l-transparent rounded-full"></span>
                Asignando...
              </>
            ) : (
              'Asignar Trabajador'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
