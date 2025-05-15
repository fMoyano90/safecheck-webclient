'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SupervisorsList from '@/components/supervisors/SupervisorsList';
import SupervisorForm from '@/components/supervisors/SupervisorForm';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { 
  getSupervisors, 
  createSupervisor, 
  updateSupervisor, 
  pauseSupervisor,
  reactivateSupervisor,
  Supervisor,
  SupervisorFormData
} from '@/lib/api/supervisors';

export default function SupervisorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentSupervisor, setCurrentSupervisor] = useState<Supervisor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
      return;
    }

    fetchSupervisors();
  }, [router]);

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSupervisors();
      
      if (Array.isArray(data)) {
        setSupervisors(data);
      } else if (data && typeof data === 'object') {
        const possibleArrayProps = Object.keys(data).find(key => Array.isArray(data[key]));
        if (possibleArrayProps) {
          setSupervisors(data[possibleArrayProps]);
        } else {
          console.error('La respuesta de la API no contiene un array:', data);
          setSupervisors([]);
        }
      } else {
        console.error('La respuesta de la API no es un array:', data);
        setSupervisors([]);
      }
    } catch (err) {
      console.error('Error al obtener supervisores:', err);
      setError('No se pudieron cargar los supervisores. Intente nuevamente.');
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupervisor = () => {
    setCurrentSupervisor(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditSupervisor = (supervisor: Supervisor) => {
    setCurrentSupervisor(supervisor);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleViewSupervisor = (supervisor: Supervisor) => {
    console.log('Ver supervisor:', supervisor);
  };

  const handlePauseSupervisor = async (supervisorId: number) => {
    try {
      setError(null);
      await pauseSupervisor(supervisorId);
      fetchSupervisors();
    } catch (err) {
      console.error('Error al pausar supervisor:', err);
      setError('No se pudo pausar el supervisor. Intente nuevamente.');
    }
  };

  const handleReactivateSupervisor = async (supervisorId: number) => {
    try {
      setError(null);
      await reactivateSupervisor(supervisorId);
      fetchSupervisors();
    } catch (err) {
      console.error('Error al reactivar supervisor:', err);
      setError('No se pudo reactivar el supervisor. Intente nuevamente.');
    }
  };

  const handleFormSubmit = async (supervisorData: SupervisorFormData) => {
    try {
      setError(null);
      if (isEditing && currentSupervisor) {
        await updateSupervisor(currentSupervisor.id, supervisorData);
      } else {
        await createSupervisor(supervisorData);
      }
      
      setIsFormOpen(false);
      fetchSupervisors();
    } catch (err) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} supervisor:`, err);
      setError(`No se pudo ${isEditing ? 'actualizar' : 'crear'} el supervisor. Intente nuevamente.`);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  if (loading && supervisors.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Supervisores</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra los supervisores de la plataforma
          </p>
        </div>
        <button
          onClick={handleAddSupervisor}
          className="px-4 py-2 text-white bg-primary rounded-md hover:bg-opacity-90 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir nuevo supervisor
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {isFormOpen ? (
        <SupervisorForm
          supervisor={currentSupervisor}
          isEditing={isEditing}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      ) : (
        <SupervisorsList
          supervisors={supervisors}
          onView={handleViewSupervisor}
          onEdit={handleEditSupervisor}
          onPause={handlePauseSupervisor}
          onReactivate={handleReactivateSupervisor}
        />
      )}
    </DashboardLayout>
  );
}
