"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import {
  createTemplate,
  getCategories,
  QuestionType,
  TemplateType,
} from "@/lib/api/templates";

// Función para generar IDs únicos (simulando uuid)
const generateId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export default function CreateChecklistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    type: TemplateType.CHECKLIST,
  });

  // Estado para las secciones y preguntas
  const [sections, setSections] = useState([
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex][field] = value;
    setSections(updatedSections);
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: generateId(),
        title: `Sección ${prev.length + 1}`,
        description: "",
        questions: [],
      },
    ]);
  };

  const removeSection = (sectionIndex) => {
    if (sections.length === 1) {
      setError("Debe haber al menos una sección en el checklist.");
      return;
    }

    setSections((prev) => prev.filter((_, index) => index !== sectionIndex));
  };
  const addQuestion = (sectionIndex, type) => {
    const newQuestion = {
      id: generateId(),
      text: "",
      type,
      required: true,
    };

    // Agregar propiedades específicas según el tipo de pregunta
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
        newQuestion.options = [
          { value: generateId(), label: "Opción 1" },
          { value: generateId(), label: "Opción 2" },
        ];
        break;
      case QuestionType.NUMBER:
        newQuestion.min = 0;
        newQuestion.max = 100;
        break;
      case QuestionType.TEXT_INPUT:
        newQuestion.maxLength = 255;
        break;
      case QuestionType.DATE:
      case QuestionType.TIME:
        newQuestion.minDate = "";
        newQuestion.maxDate = "";
        break;
      case QuestionType.PHOTO:
        newQuestion.maxPhotos = 1;
        break;
    }

    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    setSections(updatedSections);
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.splice(questionIndex, 1);
    setSections(updatedSections);
  };

  const handleQuestionChange = (sectionIndex, questionIndex, field, value) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex][field] = value;
    setSections(updatedSections);
  };

  const handleOptionChange = (
    sectionIndex,
    questionIndex,
    optionIndex,
    field,
    value
  ) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex].options[optionIndex][
      field
    ] = value;
    setSections(updatedSections);
  };

  const addOption = (sectionIndex, questionIndex) => {
    const updatedSections = [...sections];
    const options =
      updatedSections[sectionIndex].questions[questionIndex].options || [];
    options.push({
      value: generateId(),
      label: `Opción ${options.length + 1}`,
    });
    updatedSections[sectionIndex].questions[questionIndex].options = options;
    setSections(updatedSections);
  };

  const removeOption = (sectionIndex, questionIndex, optionIndex) => {
    const updatedSections = [...sections];
    const options =
      updatedSections[sectionIndex].questions[questionIndex].options;

    if (options.length <= 2) {
      setError("Debe haber al menos dos opciones para este tipo de pregunta.");
      return;
    }

    options.splice(optionIndex, 1);
    setSections(updatedSections);
  };

  const handleSubmit = async (e) => {
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
  // Función para obtener etiqueta legible del tipo de pregunta
  const getQuestionTypeLabel = (type) => {
    const labels = {
      [QuestionType.TEXT_INPUT]: "Texto Corto",
      [QuestionType.TEXT_AREA]: "Texto Largo",
      [QuestionType.NUMBER]: "Número",
      [QuestionType.BOOLEAN]: "Verdadero/Falso",
      [QuestionType.SINGLE_CHOICE]: "Selección Única",
      [QuestionType.MULTIPLE_CHOICE]: "Selección Múltiple",
      [QuestionType.DATE]: "Fecha",
      [QuestionType.TIME]: "Hora",
      [QuestionType.PHOTO]: "Foto",
      [QuestionType.SIGNATURE]: "Firma",
    };
    return labels[type] || type;
  };

  // Función para renderizar campos específicos según el tipo de pregunta
  const renderQuestionTypeFields = (question, sectionIndex, questionIndex) => {
    switch (question.type) {
      case QuestionType.TEXT_INPUT:
        return (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Longitud máxima
            </label>
            <input
              type="number"
              value={question.maxLength || ""}
              onChange={(e) =>
                handleQuestionChange(
                  sectionIndex,
                  questionIndex,
                  "maxLength",
                  parseInt(e.target.value)
                )
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        );

      case QuestionType.NUMBER:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valor mínimo
              </label>
              <input
                type="number"
                value={question.min || ""}
                onChange={(e) =>
                  handleQuestionChange(
                    sectionIndex,
                    questionIndex,
                    "min",
                    parseInt(e.target.value)
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valor máximo
              </label>
              <input
                type="number"
                value={question.max || ""}
                onChange={(e) =>
                  handleQuestionChange(
                    sectionIndex,
                    questionIndex,
                    "max",
                    parseInt(e.target.value)
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </>
        );

      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opciones
            </label>
            {question.options.map((option, optionIndex) => (
              <div key={option.value} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) =>
                    handleOptionChange(
                      sectionIndex,
                      questionIndex,
                      optionIndex,
                      "label",
                      e.target.value
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder={`Opción ${optionIndex + 1}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    removeOption(sectionIndex, questionIndex, optionIndex)
                  }
                  className="ml-2 text-red-600 hover:text-red-900"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(sectionIndex, questionIndex)}
              className="mt-1 text-sm text-primary hover:text-primary-dark"
            >
              + Agregar Opción
            </button>
          </div>
        );

      case QuestionType.DATE:
      case QuestionType.TIME:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha/Hora mínima
              </label>
              <input
                type={question.type === QuestionType.DATE ? "date" : "time"}
                value={question.minDate || ""}
                onChange={(e) =>
                  handleQuestionChange(
                    sectionIndex,
                    questionIndex,
                    "minDate",
                    e.target.value
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha/Hora máxima
              </label>
              <input
                type={question.type === QuestionType.DATE ? "date" : "time"}
                value={question.maxDate || ""}
                onChange={(e) =>
                  handleQuestionChange(
                    sectionIndex,
                    questionIndex,
                    "maxDate",
                    e.target.value
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </>
        );

      case QuestionType.PHOTO:
        return (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Número máximo de fotos
            </label>
            <input
              type="number"
              min="1"
              value={question.maxPhotos || 1}
              onChange={(e) =>
                handleQuestionChange(
                  sectionIndex,
                  questionIndex,
                  "maxPhotos",
                  parseInt(e.target.value)
                )
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        );

      default:
        return null;
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
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Información Básica
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Secciones y preguntas */}
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Sección {sectionIndex + 1}
                </h2>
                <button
                  type="button"
                  onClick={() => removeSection(sectionIndex)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar Sección
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Título de la Sección
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      handleSectionChange(sectionIndex, "title", e.target.value)
                    }
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción de la Sección
                  </label>
                  <textarea
                    value={section.description}
                    onChange={(e) =>
                      handleSectionChange(
                        sectionIndex,
                        "description",
                        e.target.value
                      )
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              {/* Preguntas */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700">Preguntas</h3>

                {section.questions.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500">
                      No hay preguntas en esta sección
                    </p>
                  </div>
                ) : (
                  section.questions.map((question, questionIndex) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-md p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Pregunta {questionIndex + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            removeQuestion(sectionIndex, questionIndex)
                          }
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Texto de la Pregunta
                          </label>
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) =>
                              handleQuestionChange(
                                sectionIndex,
                                questionIndex,
                                "text",
                                e.target.value
                              )
                            }
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Tipo de Pregunta
                          </label>
                          <div className="mt-1 text-sm text-gray-500">
                            {getQuestionTypeLabel(question.type)}
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) =>
                                handleQuestionChange(
                                  sectionIndex,
                                  questionIndex,
                                  "required",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Obligatoria
                            </span>
                          </label>
                        </div>

                        {/* Campos específicos según el tipo de pregunta */}
                        {renderQuestionTypeFields(
                          question,
                          sectionIndex,
                          questionIndex
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Botones para agregar preguntas */}
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Agregar Pregunta:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.TEXT_INPUT)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Texto Corto
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.TEXT_AREA)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Texto Largo
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.NUMBER)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Número
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.BOOLEAN)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Verdadero/Falso
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.SINGLE_CHOICE)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Selección Única
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.MULTIPLE_CHOICE)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Selección Múltiple
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.DATE)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Fecha
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.TIME)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Hora
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.PHOTO)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Foto
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addQuestion(sectionIndex, QuestionType.SIGNATURE)
                      }
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                    >
                      Firma
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
