"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/api/categories";
import { Category, FORM_TYPES_CONFIG } from "@/types";
import { TemplateType } from "@/lib/api/templates";
import CategoryModal from "@/components/categories/CategoryModal";
import CategoryList from "@/components/categories/CategoryList";

export default function SubcategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');

  useEffect(() => {
    // Verificar autenticación y permisos de administrador
    if (!isAuthenticated() || !isAdmin()) {
      router.push("/");
      return;
    }

    // Cargar subcategorías
    fetchSubcategories();
  }, [router]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategories();
      setSubcategories(categoriesData);
    } catch (err) {
      console.error("Error al cargar subcategorías:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar subcategorías";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = (newCategory: Category) => {
    setSubcategories((prev) => [...prev, newCategory]);
    setSuccess("Subcategoría creada exitosamente");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setSubcategories((prev) =>
      prev.map((cat) =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
    setSuccess("Subcategoría actualizada exitosamente");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const filteredSubcategories = filterType === 'all' 
    ? subcategories 
    : subcategories.filter(sub => sub.form_type === filterType);

  const getFormTypeLabel = (type: TemplateType) => {
    const config = FORM_TYPES_CONFIG.find(c => c.type === type);
    return config?.label || type;
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcategorías</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administre las subcategorías para diferentes tipos de formularios
          </p>
        </div>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
        >
          Nueva Subcategoría
        </button>
      </div>

      {/* Filtro por tipo de formulario */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md ${
              filterType === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Todos
          </button>
          {FORM_TYPES_CONFIG.map(config => (
            <button
              key={config.type}
              onClick={() => setFilterType(config.type)}
              className={`px-3 py-1 rounded-md ${
                filterType === config.type ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <CategoryList 
          categories={filteredSubcategories} 
          onEditCategory={handleEditCategory} 
          onRefresh={fetchSubcategories}
          showFormType={true}
          getFormTypeLabel={getFormTypeLabel}
        />
      )}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseModal}
        onCategoryCreated={editingCategory ? handleCategoryUpdated : handleCategoryCreated}
        editingCategory={editingCategory}
      />
    </DashboardLayout>
  );
}
