import React from 'react';
import { QuestionType } from '@/lib/api/templates';
import QuestionItem from './QuestionItem';

interface SectionItemProps {
  section: any;
  sectionIndex: number;
  onSectionChange: (sectionIndex: number, field: string, value: string) => void;
  onRemoveSection: (sectionIndex: number) => void;
  onQuestionChange: (sectionIndex: number, questionIndex: number, field: string, value: any) => void;
  onOptionChange: (sectionIndex: number, questionIndex: number, optionIndex: number, field: string, value: string) => void;
  onAddOption: (sectionIndex: number, questionIndex: number) => void;
  onRemoveOption: (sectionIndex: number, questionIndex: number, optionIndex: number) => void;
  onRemoveQuestion: (sectionIndex: number, questionIndex: number) => void;
  onAddQuestion: (sectionIndex: number, type: QuestionType) => void;
  getQuestionTypeLabel: (type: QuestionType) => string;
}

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  sectionIndex,
  onSectionChange,
  onRemoveSection,
  onQuestionChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onRemoveQuestion,
  onAddQuestion,
  getQuestionTypeLabel
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Sección {sectionIndex + 1}
        </h2>
        <button
          type="button"
          onClick={() => onRemoveSection(sectionIndex)}
          className="text-red-600 hover:text-red-900"
        >
          Eliminar Sección
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título de la Sección</label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onSectionChange(sectionIndex, 'title', e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
            style={{ backgroundColor: '#f9f9f9' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción de la Sección</label>
          <textarea
            value={section.description}
            onChange={(e) => onSectionChange(sectionIndex, 'description', e.target.value)}
            rows={2}
            className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
            style={{ backgroundColor: '#f9f9f9' }}
          />
        </div>
      </div>

      {/* Preguntas */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Preguntas</h3>
        
        {section.questions.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-md">
            <p className="text-gray-500">No hay preguntas en esta sección</p>
          </div>
        ) : (
          section.questions.map((question: any, questionIndex: number) => (
            <QuestionItem
              key={question.id}
              question={question}
              questionIndex={questionIndex}
              sectionIndex={sectionIndex}
              onQuestionChange={onQuestionChange}
              onOptionChange={onOptionChange}
              onAddOption={onAddOption}
              onRemoveOption={onRemoveOption}
              onRemoveQuestion={onRemoveQuestion}
              getQuestionTypeLabel={getQuestionTypeLabel}
            />
          ))
        )}
        
        {/* Botones para agregar preguntas */}
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Agregar Pregunta:</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.TEXT_INPUT)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Texto Corto
            </button>
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.TEXT_AREA)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Texto Largo
            </button>
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.NUMBER)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Número
            </button>
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.BOOLEAN)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Verdadero/Falso
            </button>
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.SINGLE_CHOICE)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Selección Única
            </button>
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.MULTIPLE_CHOICE)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Selección Múltiple
            </button>
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.DATE)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Fecha
            </button>
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.TIME)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Hora
            </button>
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.PHOTO)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Foto
            </button>
            <button
              type="button"
              onClick={() => onAddQuestion(sectionIndex, QuestionType.SIGNATURE)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
            >
              Firma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionItem;
