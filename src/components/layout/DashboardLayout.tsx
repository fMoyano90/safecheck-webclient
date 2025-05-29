'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, isAdmin, logout, getCurrentUser } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
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

  // Auto-expandir menus basado en la ruta actual
  useEffect(() => {
    if (pathname?.includes('/dashboard/forms') || pathname?.includes('/dashboard/categories')) {
      setExpandedMenus(prev => prev.includes('forms') ? prev : [...prev, 'forms']);
    }
    if (pathname?.includes('/dashboard/activities')) {
      setExpandedMenus(prev => prev.includes('activities') ? prev : [...prev, 'activities']);
    }
    if (pathname?.includes('/dashboard/admins') || pathname?.includes('/dashboard/workers') || pathname?.includes('/dashboard/supervisors')) {
      setExpandedMenus(prev => prev.includes('users') ? prev : [...prev, 'users']);
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
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
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-primary shadow-2xl">
          <div className="flex items-center justify-between h-16 px-4 bg-primary-dark">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">SafeCheck</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4">
              <SidebarItems 
                collapsed={false} 
                expandedMenus={expandedMenus} 
                toggleMenu={toggleMenu}
                currentPath={pathname || ''}
              />
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        <div className="flex flex-col w-full bg-primary shadow-xl">
          <div className="flex items-center h-16 px-4 bg-primary-dark">
            {!sidebarCollapsed ? (
              <div className="flex items-center flex-1">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                  <span className="text-primary font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-white">SafeCheck</span>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">S</span>
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors flex-shrink-0"
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 px-2 py-4">
              <SidebarItems 
                collapsed={sidebarCollapsed} 
                expandedMenus={expandedMenus} 
                toggleMenu={toggleMenu}
                currentPath={pathname || ''}
              />
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Barra superior mejorada */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Administre los recursos de su empresa</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role === 'ADMIN_PRINCIPAL' ? 'Admin Principal' : user?.role}
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
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

interface SidebarItemsProps {
  collapsed: boolean;
  expandedMenus: string[];
  toggleMenu: (menuId: string) => void;
  currentPath: string;
}

function SidebarItems({ collapsed, expandedMenus, toggleMenu, currentPath }: SidebarItemsProps) {
  return (
    <div className="space-y-1">
      <SidebarItem 
        href="/dashboard" 
        icon="dashboard" 
        label="Dashboard" 
        collapsed={collapsed}
        isActive={currentPath === '/dashboard'}
      />
      
      {/* Gestión de Usuarios con submenu */}
      <SidebarMenuGroup
        icon="users"
        label="Gestión de Usuarios"
        collapsed={collapsed}
        expanded={expandedMenus.includes('users')}
        onToggle={() => toggleMenu('users')}
        currentPath={currentPath}
        items={[
          { href: "/dashboard/admins", label: "Administradores" },
          { href: "/dashboard/workers", label: "Trabajadores" },
          { href: "/dashboard/supervisors", label: "Supervisores" }
        ]}
      />
      
      {/* Formularios con submenu */}
      <SidebarMenuGroup
        icon="clipboard"
        label="Formularios"
        collapsed={collapsed}
        expanded={expandedMenus.includes('forms')}
        onToggle={() => toggleMenu('forms')}
        currentPath={currentPath}
        items={[
          { href: "/dashboard/forms", label: "Gestión de Formularios" },
          { href: "/dashboard/categories", label: "Subcategorías" }
        ]}
      />
      
      {/* Actividades con submenu */}
      <SidebarMenuGroup
        icon="calendar"
        label="Actividades"
        collapsed={collapsed}
        expanded={expandedMenus.includes('activities')}
        onToggle={() => toggleMenu('activities')}
        currentPath={currentPath}
        items={[
          { href: "/dashboard/activities", label: "Gestionar Actividades" },
          { href: "/dashboard/activities/pending", label: "Pendientes de Revisión" },
          { href: "/dashboard/activities/history", label: "Historial de Actividades" }
        ]}
      />
      
      <SidebarItem 
        href="/dashboard/reports" 
        icon="chart" 
        label="Reportes" 
        collapsed={collapsed}
        isActive={currentPath === '/dashboard/reports'}
      />
    </div>
  );
}

interface SidebarMenuGroupProps {
  icon: string;
  label: string;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
  currentPath: string;
  items: { href: string; label: string }[];
}

function SidebarMenuGroup({ icon, label, collapsed, expanded, onToggle, currentPath, items }: SidebarMenuGroupProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'clipboard':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

  // Verificar si algún item del grupo está activo
  const hasActiveItem = items.some(item => currentPath === item.href);

  if (collapsed) {
    return (
      <div className="group relative">
        <button
          className={`flex items-center justify-center px-2 py-3 text-sm font-medium text-white rounded-lg hover:bg-primary-dark transition-all duration-200 w-full ${
            hasActiveItem ? 'bg-primary-dark' : ''
          }`}
        >
          <div className="text-white flex-shrink-0">
            {getIcon(icon)}
          </div>
        </button>
        
        {/* Submenu expandido para modo colapsado */}
        <div className="absolute left-full top-0 ml-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto whitespace-nowrap z-50 min-w-48">
          <div className="p-2">
            <div className="font-medium px-3 py-2 border-b border-gray-700">{label}</div>
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`block px-3 py-2 hover:bg-gray-800 rounded transition-colors ${
                  currentPath === item.href ? 'bg-gray-700' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="absolute top-2 left-0 transform -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-2 py-3 text-sm font-medium text-white rounded-lg hover:bg-primary-dark transition-all duration-200 ${
          hasActiveItem ? 'bg-primary-dark' : ''
        }`}
      >
        <div className="flex items-center">
          <div className="text-white flex-shrink-0">
            {getIcon(icon)}
          </div>
          <span className="ml-3 whitespace-nowrap overflow-hidden">{label}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Submenu */}
      <div className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${
        expanded ? 'max-h-96' : 'max-h-0'
      }`}>
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`flex items-center px-2 py-2 text-sm text-white rounded-lg transition-colors ${
              currentPath === item.href 
                ? 'bg-primary-dark border-l-4 border-white' 
                : 'hover:bg-primary-dark hover:bg-opacity-60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-3 ${
              currentPath === item.href ? 'bg-white' : 'bg-white opacity-60'
            }`}></div>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

interface SidebarItemProps {
  href: string;
  icon: string;
  label: string;
  collapsed: boolean;
  isActive: boolean;
}

function SidebarItem({ href, icon, label, collapsed, isActive }: SidebarItemProps) {
  
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
    <div className="group relative">
      <Link 
        href={href}
        className={`flex items-center text-sm font-medium text-white rounded-lg transition-all duration-200 ${
          collapsed ? 'justify-center px-2 py-3' : 'px-2 py-3'
        } ${
          isActive ? 'bg-primary-dark' : 'hover:bg-primary-dark'
        }`}
      >
        <div className="text-white flex-shrink-0">
          {getIcon(icon)}
        </div>
        {!collapsed && (
          <span className="ml-3 whitespace-nowrap overflow-hidden">{label}</span>
        )}
      </Link>
      
      {/* Tooltip para cuando está colapsado */}
      {collapsed && (
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {label}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
}
