'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación y permisos de administrador
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Administrador</h1>
        <p className="mt-1 text-sm text-gray-600">
          Bienvenido al panel de administración de SafeCheck
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Administradores"
          value="5"
          description="Total de administradores"
          icon="users"
          color="bg-primary"
        />
        <StatCard
          title="Supervisores"
          value="12"
          description="Total de supervisores"
          icon="user-check"
          color="bg-success"
        />
        <StatCard
          title="Trabajadores"
          value="48"
          description="Total de trabajadores"
          icon="users"
          color="bg-warning"
        />
        <StatCard
          title="Checklists"
          value="24"
          description="Plantillas disponibles"
          icon="clipboard"
          color="bg-info"
        />
        <StatCard
          title="Reportes"
          value="156"
          description="Generados este mes"
          icon="chart"
          color="bg-danger"
        />
        <StatCard
          title="Categorías"
          value="8"
          description="Categorías de plantillas"
          icon="folder"
          color="bg-secondary"
        />
      </div>

      {/* Sección de visualización de datos y tendencias */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Visualización de Datos y Tendencias</h2>
        <div className="p-6 mt-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
            <p className="text-gray-500">Aquí se mostrará el gráfico de tendencias</p>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Levantamiento de Checklists</h3>
              <p className="text-lg font-semibold text-gray-900">24 esta semana</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Trabajo Realizado</h3>
              <p className="text-lg font-semibold text-gray-900">18 tareas completadas</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Incidentes Reportados</h3>
              <p className="text-lg font-semibold text-gray-900">3 esta semana</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'clipboard':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'user-check':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'folder':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
            <div className="text-white">{getIcon(icon)}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
              <dd className="mt-1 text-xs text-gray-500">{description}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
