"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/api/categories";
import { Category } from "@/types";
import CategoryModal from "@/components/categories/CategoryModal";
import CategoryList from "@/components/categories/CategoryList";

export default function CategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Verificar autenticación y permisos de administrador
    if (!isAuthenticated() || !isAdmin()) {
      router.push("/");
      return;
    }

    // Cargar categorías
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar categorías";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
    setSuccess("Categoría creada exitosamente");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
    setSuccess("Categoría actualizada exitosamente");
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

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administre las categorías para checklists y ARTs
          </p>
        </div>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
        >
          Nueva Categoría
        </button>
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
          categories={categories} 
          onEditCategory={handleEditCategory} 
          onRefresh={fetchCategories}
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
