"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import {
  createTemplate,
  QuestionType,
  TemplateType,
} from "@/lib/api/templates";
import { getCategories } from "@/lib/api/categories";
import BasicInfo from "@/components/checklists/BasicInfo";
import SectionItem from "@/components/checklists/SectionItem";
import {
  generateId,
  getQuestionTypeLabel,
  createNewQuestion,
} from "@/components/checklists/utils";
import { Category, FormData, Section } from "@/types";

export default function CreateChecklistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    categoryId: "",
    type: TemplateType.CHECKLIST,
  });

  // Estado para las secciones y preguntas
  const [sections, setSections] = useState<Section[]>([
    {
      id: generateId(),
      title: "Sección 1",
      description: "",
      questions: [],
    },
  ]);

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
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError(
        "No se pudieron cargar las categorías. Por favor, intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryCreated = (newCategory: Category) => {
    // Añadir la nueva categoría a la lista y seleccionarla
    setCategories(prev => [...prev, newCategory]);
    setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (
    sectionIndex: number,
    field: string,
    value: string
  ): void => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex][field] = value;
    setSections(updatedSections);
  };

  const addSection = (): void => {
    setSections([
      ...sections,
      {
        id: generateId(),
        title: `Sección ${sections.length + 1}`,
        description: "",
        questions: [],
      },
    ]);
  };

  const removeSection = (sectionIndex: number): void => {
    if (sections.length === 1) {
      setError("Debe haber al menos una sección en el checklist.");
      return;
    }

    setSections((prev) => prev.filter((_, index) => index !== sectionIndex));
  };

  const addQuestion = (sectionIndex: number, type: QuestionType): void => {
    const newQuestion = createNewQuestion(type);
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    setSections(updatedSections);
  };

  const removeQuestion = (
    sectionIndex: number,
    questionIndex: number
  ): void => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.splice(questionIndex, 1);
    setSections(updatedSections);
  };

  const handleQuestionChange = (
    sectionIndex: number,
    questionIndex: number,
    field: string,
    value: string | boolean | number
  ): void => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex][field] = value;
    setSections(updatedSections);
  };

  const handleOptionChange = (
    sectionIndex: number,
    questionIndex: number,
    optionIndex: number,
    field: string,
    value: string
  ): void => {
    const updatedSections = [...sections];
    const question = updatedSections[sectionIndex].questions[questionIndex];
    
    if (question.options) {
      question.options[optionIndex][field] = value;
      setSections(updatedSections);
    }
  };

  const addOption = (sectionIndex: number, questionIndex: number): void => {
    const updatedSections = [...sections];
    const question = updatedSections[sectionIndex].questions[questionIndex];
    const options = question.options || [];
    options.push({
      value: generateId(),
      label: `Opción ${options.length + 1}`,
    });
    question.options = options;
    setSections(updatedSections);
  };

  const removeOption = (
    sectionIndex: number,
    questionIndex: number,
    optionIndex: number
  ): void => {
    const updatedSections = [...sections];
    const question = updatedSections[sectionIndex].questions[questionIndex];
    const options = question.options;

    if (!options || options.length <= 2) {
      setError("Debe haber al menos dos opciones para este tipo de pregunta.");
      return;
    }

    options.splice(optionIndex, 1);
    setSections(updatedSections);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar que haya al menos una pregunta en cada sección
    const invalidSection = sections.find(
      (section) => section.questions.length === 0
    );
    if (invalidSection) {
      setError(
        `La sección "${invalidSection.title}" no tiene preguntas. Agregue al menos una pregunta.`
      );
      return;
    }

    // Validar que todas las preguntas tengan texto
    for (const section of sections) {
      const invalidQuestion = section.questions.find(
        (question) => !question.text.trim()
      );
      if (invalidQuestion) {
        setError(
          `Hay una pregunta sin texto en la sección "${section.title}".`
        );
        return;
      }

      // Validar opciones para preguntas de selección
      for (const question of section.questions) {
        if (
          (question.type === QuestionType.SINGLE_CHOICE ||
            question.type === QuestionType.MULTIPLE_CHOICE) &&
          question.options
        ) {
          const invalidOption = question.options.find(
            (option) => !option.label.trim()
          );
          if (invalidOption) {
            setError(
              `Hay una opción sin texto en la pregunta "${question.text}".`
            );
            return;
          }
        }
      }
    }

    try {
      setSubmitting(true);

      // Preparar datos para enviar
      const templateData = {
        ...formData,
        // Asegurar que categoryId sea un número
        categoryId: typeof formData.categoryId === 'string' ? parseInt(formData.categoryId, 10) : formData.categoryId,
        structure: { sections },
      };

      // Enviar datos a la API
      await createTemplate(templateData);

      setSuccess("Checklist creado exitosamente");

      // Redireccionar después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard/checklists");
      }, 2000);
    } catch (err) {
      console.error("Error al crear el checklist:", err);
      setError("No se pudo crear el checklist. Por favor, intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Crear Nuevo Checklist
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Cree un nuevo checklist con diferentes tipos de preguntas
        </p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica del checklist */}
          <BasicInfo
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
            onCategoryCreated={handleCategoryCreated}
          />

          {/* Secciones y preguntas */}
          {sections.map((section, sectionIndex) => (
            <SectionItem
              key={section.id}
              section={section}
              sectionIndex={sectionIndex}
              onSectionChange={handleSectionChange}
              onRemoveSection={removeSection}
              onQuestionChange={handleQuestionChange}
              onOptionChange={handleOptionChange}
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onRemoveQuestion={removeQuestion}
              onAddQuestion={addQuestion}
              getQuestionTypeLabel={getQuestionTypeLabel}
            />
          ))}

          {/* Botón para agregar sección */}
          <div>
            <button
              type="button"
              onClick={addSection}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              + Agregar Sección
            </button>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/checklists")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
            >
              {submitting ? "Guardando..." : "Guardar Checklist"}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
