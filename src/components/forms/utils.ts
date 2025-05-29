import { QuestionType } from '@/lib/api/templates';

// Función para generar IDs únicos (simulando uuid)
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Función para obtener etiqueta legible del tipo de pregunta
export const getQuestionTypeLabel = (type: QuestionType) => {
  const labels = {
    [QuestionType.TEXT_INPUT]: 'Texto Corto',
    [QuestionType.TEXT_AREA]: 'Texto Largo',
    [QuestionType.NUMBER]: 'Número',
    [QuestionType.BOOLEAN]: 'Verdadero/Falso',
    [QuestionType.SINGLE_CHOICE]: 'Selección Única',
    [QuestionType.MULTIPLE_CHOICE]: 'Selección Múltiple',
    [QuestionType.DATE]: 'Fecha',
    [QuestionType.TIME]: 'Hora',
    [QuestionType.PHOTO]: 'Foto',
    [QuestionType.SIGNATURE]: 'Firma',
  };
  return labels[type] || type;
};

// Función para crear una nueva pregunta con propiedades específicas según el tipo
export const createNewQuestion = (type: QuestionType) => {
  const newQuestion = {
    id: generateId(),
    text: '',
    type,
    required: true,
  };

  // Agregar propiedades específicas según el tipo de pregunta
  switch (type) {
    case QuestionType.SINGLE_CHOICE:
    case QuestionType.MULTIPLE_CHOICE:
      // Generar id únicos basados en timestamp para evitar colisiones
      const timestamp = Date.now();
      return {
        ...newQuestion,
        options: [
          { value: `option-1-${timestamp}`, label: 'Opción 1' },
          { value: `option-2-${timestamp}`, label: 'Opción 2' },
        ],
      };
    case QuestionType.NUMBER:
      return {
        ...newQuestion,
        min: 0,
        max: 100,
      };
    case QuestionType.TEXT_INPUT:
      return {
        ...newQuestion,
        maxLength: 255,
      };
    case QuestionType.DATE:
    case QuestionType.TIME:
      return {
        ...newQuestion,
        minDate: '',
        maxDate: '',
      };
    case QuestionType.PHOTO:
      return {
        ...newQuestion,
        maxPhotos: 1,
      };
    default:
      return newQuestion;
  }
};
