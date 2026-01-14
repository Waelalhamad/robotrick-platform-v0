import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Button, Input } from '../ui';
import type { QuizQuestion } from '../../hooks/useTrainerQuizzes';

interface QuestionEditorProps {
  question: QuizQuestion;
  index: number;
  onChange: (question: QuizQuestion) => void;
  onDelete: () => void;
}

export default function QuestionEditor({ question, index, onChange, onDelete }: QuestionEditorProps) {
  const handleQuestionChange = (field: keyof QuizQuestion, value: any) => {
    onChange({ ...question, [field]: value });
  };

  const handleOptionChange = (optionIndex: number, field: 'text' | 'isCorrect', value: any) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };

    // For single choice, uncheck other options when one is checked
    if (field === 'isCorrect' && value && question.type === 'single') {
      newOptions.forEach((opt, idx) => {
        if (idx !== optionIndex) opt.isCorrect = false;
      });
    }

    onChange({ ...question, options: newOptions });
  };

  const addOption = () => {
    onChange({
      ...question,
      options: [...question.options, { text: '', isCorrect: false }],
    });
  };

  const removeOption = (optionIndex: number) => {
    if (question.options.length <= 2) {
      alert('A question must have at least 2 options');
      return;
    }
    const newOptions = question.options.filter((_, idx) => idx !== optionIndex);
    onChange({ ...question, options: newOptions });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm"
    >
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Question {index + 1}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-error hover:text-error"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question *
        </label>
        <textarea
          value={question.question}
          onChange={(e) => handleQuestionChange('question', e.target.value)}
          placeholder="Enter your question..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows={3}
          required
        />
      </div>

      {/* Question Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`type-${index}`}
              value="single"
              checked={question.type === 'single'}
              onChange={() => handleQuestionChange('type', 'single')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm text-gray-700">Single Choice</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`type-${index}`}
              value="multiple"
              checked={question.type === 'multiple'}
              onChange={() => handleQuestionChange('type', 'multiple')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm text-gray-700">Multiple Choice</span>
          </label>
        </div>
      </div>

      {/* Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Options * (Check correct answer{question.type === 'multiple' ? 's' : ''})
        </label>
        <div className="space-y-3">
          <AnimatePresence>
            {question.options.map((option, optionIndex) => (
              <motion.div
                key={optionIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3"
              >
                {/* Correct answer checkbox */}
                <button
                  type="button"
                  onClick={() => handleOptionChange(optionIndex, 'isCorrect', !option.isCorrect)}
                  className={`flex-shrink-0 transition-colors ${
                    option.isCorrect ? 'text-success' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
                >
                  {option.isCorrect ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                {/* Option text input */}
                <Input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(optionIndex, 'text', e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1"
                  required
                />

                {/* Remove option button */}
                {question.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(optionIndex)}
                    className="text-error hover:text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={addOption}
          leftIcon={<Plus className="w-4 h-4" />}
          className="mt-3"
        >
          Add Option
        </Button>
      </div>

      {/* Points */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points
          </label>
          <Input
            type="number"
            value={question.points}
            onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1)}
            min="1"
            max="100"
            required
          />
        </div>

        {/* Explanation (optional) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={question.explanation || ''}
            onChange={(e) => handleQuestionChange('explanation', e.target.value)}
            placeholder="Explain the correct answer..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={2}
          />
        </div>
      </div>
    </motion.div>
  );
}
