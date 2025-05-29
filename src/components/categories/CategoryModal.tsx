"use client";

import React, { useState, useEffect } from 'react';
import { createCategory, updateCategory } from '@/lib/api/categories';
import { Category, FORM_TYPES_CONFIG } from '@/types';
import { TemplateType } from '@/lib/api/templates';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
  editingCategory: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onCategoryCreated, editingCategory }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#0a7ea4', // Color primario por defecto
    form_type: TemplateType.CHECKLIST // Tipo por defecto
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Cargar datos de la subcategoría a editar cuando cambia
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || '',
        color: editingCategory.color || '#0a7ea4',
        form_type: editingCategory.form_type || TemplateType.CHECKLIST
      });
    } else {
      // Restablecer el formulario si no hay subcategoría para editar
      setFormData({
        name: '',
        description: '',
        color: '#0a7ea4',
        form_type: TemplateType.CHECKLIST
      });
    }
  }, [editingCategory, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!formData.name.trim()) {
      setError('El nombre de la subcategoría es obligatorio');
      return;
    }

    try {
      setLoading(true);
      
      let resultCategory;
      
      if (editingCategory) {
        // Actualizar subcategoría existente
        resultCategory = await updateCategory(Number(editingCategory.id), {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          form_type: formData.form_type,
          // Mantener el estado actual si estamos editando
          isActive: editingCategory.is_active
        });
      } else {
        // Crear nueva subcategoría
        resultCategory = await createCategory({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          form_type: formData.form_type
        });
      }
      
      // Notificar al componente padre sobre la subcategoría creada/actualizada
      onCategoryCreated(resultCategory);
      
      // Limpiar el formulario y cerrar el modal
      setFormData({
        name: '',
        description: '',
        color: '#0a7ea4',
        form_type: TemplateType.CHECKLIST
      });
      onClose();
    } catch (err) {
      console.error(`Error al ${editingCategory ? 'actualizar' : 'crear'} la subcategoría:`, err);
      
      // Mejorar el mensaje de error para ser más descriptivo
      let errorMessage = '';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = `Error al ${editingCategory ? 'actualizar' : 'crear'} la subcategoría. Por favor, intente nuevamente.`;
      }
      
      // Mostrar mensaje de error más amigable
      setError(`${errorMessage} ${editingCategory ? 'Verifique que la subcategoría exista y tenga permisos para editarla.' : ''}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingCategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Formulario *
              </label>
              <select
                name="form_type"
                value={formData.form_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-black"
                style={{ backgroundColor: '#f9f9f9' }}
                required
              >
                {FORM_TYPES_CONFIG.map(config => (
                  <option key={config.type} value={config.type}>
                    {config.label} - {config.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-black"
                placeholder="Nombre de la subcategoría"
                style={{ backgroundColor: '#f9f9f9' }}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-black"
                placeholder="Descripción de la subcategoría (opcional)"
                style={{ backgroundColor: '#f9f9f9' }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="h-10 w-10 border border-gray-300 rounded-md mr-2"
                />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-black"
                  placeholder="#000000"
                  style={{ backgroundColor: '#f9f9f9' }}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Guardando...' : editingCategory ? 'Actualizar Subcategoría' : 'Guardar Subcategoría'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
