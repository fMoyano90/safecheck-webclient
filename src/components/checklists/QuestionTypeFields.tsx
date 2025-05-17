import React from 'react';
import { QuestionType } from '@/lib/api/templates';
import QuestionOption from './QuestionOption';

interface QuestionTypeFieldsProps {
  question: any;
  sectionIndex: number;
  questionIndex: number;
  onQuestionChange: (sectionIndex: number, questionIndex: number, field: string, value: any) => void;
  onOptionChange: (sectionIndex: number, questionIndex: number, optionIndex: number, field: string, value: string) => void;
  onAddOption: (sectionIndex: number, questionIndex: number) => void;
  onRemoveOption: (sectionIndex: number, questionIndex: number, optionIndex: number) => void;
}

const QuestionTypeFields: React.FC<QuestionTypeFieldsProps> = ({
  question,
  sectionIndex,
  questionIndex,
  onQuestionChange,
  onOptionChange,
  onAddOption,
  onRemoveOption
}) => {
  switch (question.type) {
    case QuestionType.TEXT_INPUT:
      return (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Longitud máxima</label>
          <input
            type="number"
            value={question.maxLength || ''}
            onChange={(e) => onQuestionChange(sectionIndex, questionIndex, 'maxLength', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
      );
      
    case QuestionType.NUMBER:
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valor mínimo</label>
            <input
              type="number"
              value={question.min || ''}
              onChange={(e) => onQuestionChange(sectionIndex, questionIndex, 'min', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valor máximo</label>
            <input
              type="number"
              value={question.max || ''}
              onChange={(e) => onQuestionChange(sectionIndex, questionIndex, 'max', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </>
      );
      
    case QuestionType.SINGLE_CHOICE:
    case QuestionType.MULTIPLE_CHOICE:
      return (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Opciones</label>
          {question.options.map((option: any, optionIndex: number) => (
            <QuestionOption
              key={option.value}
              option={option}
              optionIndex={optionIndex}
              onChange={(field, value) => onOptionChange(sectionIndex, questionIndex, optionIndex, field, value)}
              onRemove={() => onRemoveOption(sectionIndex, questionIndex, optionIndex)}
            />
          ))}
          <button
            type="button"
            onClick={() => onAddOption(sectionIndex, questionIndex)}
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
            <label className="block text-sm font-medium text-gray-700">Fecha/Hora mínima</label>
            <input
              type={question.type === QuestionType.DATE ? 'date' : 'time'}
              value={question.minDate || ''}
              onChange={(e) => onQuestionChange(sectionIndex, questionIndex, 'minDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha/Hora máxima</label>
            <input
              type={question.type === QuestionType.DATE ? 'date' : 'time'}
              value={question.maxDate || ''}
              onChange={(e) => onQuestionChange(sectionIndex, questionIndex, 'maxDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </>
      );
      
    case QuestionType.PHOTO:
      return (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Número máximo de fotos</label>
          <input
            type="number"
            min="1"
            value={question.maxPhotos || 1}
            onChange={(e) => onQuestionChange(sectionIndex, questionIndex, 'maxPhotos', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
      );
      
    default:
      return null;
  }
};

export default QuestionTypeFields;
