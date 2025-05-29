'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function PendingActivitiesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Pendientes de Revisión</h1>
            <p className="text-sm text-gray-500">Actividades completadas que requieren aprobación</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              8 Pendientes
            </span>
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Prioridad:</label>
              <select className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha límite:</label>
              <select className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Todas</option>
                <option value="hoy">Vencen hoy</option>
                <option value="semana">Esta semana</option>
                <option value="vencidas">Vencidas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de actividades pendientes */}
        <div className="space-y-4">
          {/* Actividad pendiente 1 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Inspección de Seguridad - Sector B</h3>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Prioridad Alta
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Vence Hoy
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p><span className="font-medium">Trabajador:</span> Ana Martínez - Supervisora de seguridad</p>
                  <p><span className="font-medium">Formulario:</span> Checklist de seguridad básica</p>
                  <p><span className="font-medium">Completado:</span> 14/12/2024 a las 16:30</p>
                  <p><span className="font-medium">Fecha límite revisión:</span> 15/12/2024</p>
                </div>
                <div className="text-sm text-gray-500">
                  La actividad fue completada y requiere revisión para verificar el cumplimiento de los protocolos de seguridad.
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-6">
                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  Aprobar
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors">
                  Revisar
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>

          {/* Actividad pendiente 2 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Reporte de Mantenimiento Preventivo</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Prioridad Media
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p><span className="font-medium">Trabajador:</span> Roberto Silva - Técnico de mantenimiento</p>
                  <p><span className="font-medium">Formulario:</span> ART - Mantenimiento de equipos</p>
                  <p><span className="font-medium">Completado:</span> 13/12/2024 a las 14:15</p>
                  <p><span className="font-medium">Fecha límite revisión:</span> 18/12/2024</p>
                </div>
                <div className="text-sm text-gray-500">
                  Informe completo del mantenimiento realizado en las máquinas del sector de producción.
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-6">
                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  Aprobar
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors">
                  Revisar
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>

          {/* Actividad pendiente 3 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Capacitación en Normas de Seguridad</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    Prioridad Baja
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p><span className="font-medium">Trabajador:</span> Laura Torres - Operaria</p>
                  <p><span className="font-medium">Formulario:</span> Evaluación post-capacitación</p>
                  <p><span className="font-medium">Completado:</span> 12/12/2024 a las 11:45</p>
                  <p><span className="font-medium">Fecha límite revisión:</span> 20/12/2024</p>
                </div>
                <div className="text-sm text-gray-500">
                  Evaluación completada después de la capacitación sobre nuevas normas de seguridad industrial.
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-6">
                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  Aprobar
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors">
                  Revisar
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones masivas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              ¿Necesitas revisar múltiples actividades a la vez?
            </div>
            <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors">
              Acciones Masivas
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 