"use client";

import React, { useState } from 'react';
import { Category } from '@/types';
import { updateCategoryStatus, deleteCategory } from '@/lib/api/categories';

interface CategoryListProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onRefresh: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onEditCategory, onRefresh }) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState('');

  const handleToggleStatus = async (category: Category) => {
    try {
      setLoading(prev => ({ ...prev, [category.id]: true }));
      await updateCategoryStatus(category.id, !category.is_active);
      onRefresh();
    } catch (err) {
      console.error('Error al cambiar estado de categoría:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado de categoría';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(prev => ({ ...prev, [category.id]: false }));
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('¿Está seguro que desea eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, [categoryId]: true }));
      await deleteCategory(categoryId);
      onRefresh();
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border-b border-red-200">
          {error}
        </div>
      )}
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Color
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
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
          {categories.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                No hay categorías disponibles
              </td>
            </tr>
          ) : (
            categories.map(category => (
              <tr key={category.id} className={!category.is_active ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: category.color || '#cccccc' }}
                  ></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 line-clamp-2">{category.description || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditCategory(category)}
                      className="text-primary hover:text-primary-dark"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(category)}
                      disabled={loading[category.id]}
                      className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                    >
                      {loading[category.id] ? 'Procesando...' : category.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={loading[category.id]}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;
