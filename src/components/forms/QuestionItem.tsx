import React from 'react';
import { QuestionType } from '@/lib/api/templates';
import QuestionTypeFields from './QuestionTypeFields';
import { Question } from '@/types';

interface QuestionItemProps {
  question: Question;
  questionIndex: number;
  sectionIndex: number;
  onQuestionChange: (sectionIndex: number, questionIndex: number, field: string, value: string | boolean | number) => void;
  onOptionChange: (sectionIndex: number, questionIndex: number, optionIndex: number, field: string, value: string) => void;
  onAddOption: (sectionIndex: number, questionIndex: number) => void;
  onRemoveOption: (sectionIndex: number, questionIndex: number, optionIndex: number) => void;
  onRemoveQuestion: (sectionIndex: number, questionIndex: number) => void;
  getQuestionTypeLabel: (type: QuestionType) => string;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  questionIndex,
  sectionIndex,
  onQuestionChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onRemoveQuestion,
  getQuestionTypeLabel
}) => {
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-700">
          Pregunta {questionIndex + 1}
        </h4>
        <button
          type="button"
          onClick={() => onRemoveQuestion(sectionIndex, questionIndex)}
          className="text-red-600 hover:text-red-900 text-sm"
        >
          Eliminar
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Texto de la Pregunta</label>
          <input
            type="text"
            value={question.text}
            onChange={(e) => onQuestionChange(sectionIndex, questionIndex, 'text', e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
            style={{ backgroundColor: '#f9f9f9' }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Pregunta</label>
          <div className="mt-1 text-sm text-gray-500">
            {getQuestionTypeLabel(question.type)}
          </div>
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onQuestionChange(sectionIndex, questionIndex, 'required', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Obligatoria</span>
          </label>
        </div>
        
        {/* Campos específicos según el tipo de pregunta */}
        <QuestionTypeFields
          question={question}
          sectionIndex={sectionIndex}
          questionIndex={questionIndex}
          onQuestionChange={onQuestionChange}
          onOptionChange={onOptionChange}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
        />
      </div>
    </div>
  );
};

export default QuestionItem;
