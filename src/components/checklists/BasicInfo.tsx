import React, { useState } from 'react';
import { Category } from '@/types';
import CategoryModal from '@/components/categories/CategoryModal';

interface BasicInfoProps {
  formData: {
    name: string;
    description: string;
    categoryId: string;
  };
  categories: Category[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCategoryCreated: (category: Category) => void;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ formData, categories, onInputChange, onCategoryCreated }) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            required
            className="mt-1 block w-full h-[38px] px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
            style={{ backgroundColor: '#f9f9f9' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <div className="flex items-stretch space-x-0 mt-1">
            <div className="relative flex-grow">
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={onInputChange}
                required
                className="block w-full h-[38px] px-3 py-2 rounded-md rounded-r-none border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
                style={{ backgroundColor: '#f9f9f9' }}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center justify-center w-10 h-[38px] border border-gray-300 border-l-0 rounded-md rounded-l-none text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              title="Añadir nueva categoría"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows={3}
            className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
            style={{ backgroundColor: '#f9f9f9' }}
          />
        </div>
      </div>
      
      {/* Modal para crear nueva categoría */}
      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        onCategoryCreated={onCategoryCreated}
        editingCategory={null}
      />
    </div>
  );
};

export default BasicInfo;
