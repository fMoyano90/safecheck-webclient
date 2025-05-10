'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, isAdmin, logout, getCurrentUser } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null>(null);
  
  useEffect(() => {
    // Verificar autenticación y permisos de administrador
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
      return;
    }
    
    setUser(getCurrentUser());
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para móviles */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-primary">
          <div className="flex items-center justify-between h-16 px-4 bg-primary-dark">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">SafeCheck</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4">
              <SidebarItems />
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-1 min-h-0 bg-primary">
            <div className="flex items-center h-16 px-4 bg-primary-dark">
              <span className="text-xl font-bold text-white">SafeCheck</span>
            </div>
            <div className="flex flex-col flex-1 overflow-y-auto">
              <nav className="flex-1 px-2 py-4">
                <SidebarItems />
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Barra superior */}
        <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 sm:px-6 lg:px-8">
          <button
            className="text-gray-500 focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm text-white bg-primary rounded-md hover:bg-opacity-90"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarItems() {
  return (
    <div className="space-y-1">
      <SidebarItem href="/dashboard" icon="dashboard" label="Dashboard" />
      <SidebarItem href="/dashboard/admins" icon="users" label="Administradores" />
      <SidebarItem href="/dashboard/checklists" icon="clipboard" label="Checklists" />
      <SidebarItem href="/dashboard/workers" icon="users" label="Trabajadores" />
      <SidebarItem href="/dashboard/supervisors" icon="user-check" label="Supervisores" />
      <SidebarItem href="/dashboard/reports" icon="chart" label="Reportes" />
    </div>
  );
}

interface SidebarItemProps {
  href: string;
  icon: string;
  label: string;
}

function SidebarItem({ href, icon, label }: SidebarItemProps) {
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'dashboard':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'clipboard':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'user-check':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
    }
  };

  return (
    <Link 
      href={href}
      className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-primary-dark group"
    >
      <div className="mr-3 text-white">{getIcon(icon)}</div>
      {label}
    </Link>
  );
}
