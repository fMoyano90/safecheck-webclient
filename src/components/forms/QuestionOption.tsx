import React from 'react';

interface QuestionOptionProps {
  option: {
    value: string;
    label: string;
  };
  optionIndex: number;
  onRemove: () => void;
  onChange: (field: string, value: string) => void;
}

const QuestionOption: React.FC<QuestionOptionProps> = ({ 
  option, 
  optionIndex, 
  onRemove, 
  onChange 
}) => {
  return (
    <div className="flex items-center mb-2">
      <input
        type="text"
        value={option.label}
        onChange={(e) => onChange('label', e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        placeholder={`Opción ${optionIndex + 1}`}
      />
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 text-red-600 hover:text-red-900"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default QuestionOption;
