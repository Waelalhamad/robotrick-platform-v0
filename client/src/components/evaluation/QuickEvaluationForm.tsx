/**
 * QuickEvaluationForm Component
 *
 * Simplified evaluation form with dynamic criteria
 * Fetches evaluation parameters configured by CLO
 *
 * @component QuickEvaluationForm
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Star, AlertCircle, Loader } from 'lucide-react';
import { RatingInput } from './RatingInput';
import { api } from '../../lib/api';
import type { QuickEvaluationInput } from '../../shared/types/evaluation.types';

interface QuickEvaluationFormProps {
  studentId: string;
  studentName: string;
  sessionId: string;
  groupId: string;
  onSubmit: (data: QuickEvaluationInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<QuickEvaluationInput>;
}

interface EvaluationParameter {
  name: string;
  description?: string;
  type: 'rating' | 'percentage' | 'grade' | 'boolean' | 'text';
  ratingScale?: {
    min: number;
    max: number;
  };
  weight: number;
  required: boolean;
  order: number;
}

interface EvaluationCriteria {
  _id: string;
  name: string;
  parameters: EvaluationParameter[];
  includeOverallRating: boolean;
  overallRatingScale?: {
    min: number;
    max: number;
  };
  includeComments: boolean;
  requireComments: boolean;
}

export const QuickEvaluationForm: React.FC<QuickEvaluationFormProps> = ({
  studentId,
  studentName,
  sessionId,
  groupId,
  onSubmit,
  onCancel,
  initialData
}) => {
  const [criteria, setCriteria] = useState<EvaluationCriteria | null>(null);
  const [loadingCriteria, setLoadingCriteria] = useState(true);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    studentId,
    sessionId,
    groupId,
    overallRating: initialData?.overallRating || 3,
    parameters: initialData?.parameters || {},
    trainerNotes: initialData?.trainerNotes || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch evaluation criteria for this group
  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        setLoadingCriteria(true);
        setCriteriaError(null);
        const response = await api.get(`/trainer/evaluations/criteria/group/${groupId}`);
        setCriteria(response.data.data);
      } catch (err: any) {
        console.error('Error fetching criteria:', err);
        setCriteriaError(err.response?.data?.message || 'No evaluation criteria found for this group');
      } finally {
        setLoadingCriteria(false);
      }
    };

    if (groupId) {
      fetchCriteria();
    }
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required parameters
    if (criteria) {
      for (const param of criteria.parameters) {
        if (param.required && !formData.parameters[param.name]) {
          setError(`${param.name} is required`);
          return;
        }
      }

      if (criteria.includeOverallRating && !formData.overallRating) {
        setError('Overall rating is required');
        return;
      }

      if (criteria.requireComments && !formData.trainerNotes?.trim()) {
        setError('Comments are required');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramName]: value
      }
    }));
  };

  const renderParameterInput = (param: EvaluationParameter) => {
    const value = formData.parameters[param.name];

    switch (param.type) {
      case 'rating':
        return (
          <RatingInput
            label={param.name}
            description={param.description}
            value={value || param.ratingScale?.min || 1}
            onChange={(rating) => handleParameterChange(param.name, rating)}
            min={param.ratingScale?.min || 1}
            max={param.ratingScale?.max || 5}
            required={param.required}
          />
        );

      case 'percentage':
        return (
          <div>
            <label className="block text-sm font-semibold text-[#003300] mb-2">
              {param.name} {param.required && <span className="text-red-500">*</span>}
            </label>
            {param.description && (
              <p className="text-xs text-[#003300]/60 mb-2">{param.description}</p>
            )}
            <input
              type="number"
              min="0"
              max="100"
              value={value || ''}
              onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-[#003300]/20 rounded-xl text-[#003300] placeholder:text-[#003300]/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="0-100%"
              required={param.required}
            />
          </div>
        );

      case 'boolean':
        return (
          <div>
            <label className="block text-sm font-semibold text-[#003300] mb-2">
              {param.name} {param.required && <span className="text-red-500">*</span>}
            </label>
            {param.description && (
              <p className="text-xs text-[#003300]/60 mb-2">{param.description}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleParameterChange(param.name, true)}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  value === true
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-white border-[#003300]/20 text-[#003300]/60 hover:border-[#003300]/30'
                }`}
              >
                ✓ Yes
              </button>
              <button
                type="button"
                onClick={() => handleParameterChange(param.name, false)}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  value === false
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-white border-[#003300]/20 text-[#003300]/60 hover:border-[#003300]/30'
                }`}
              >
                ✗ No
              </button>
            </div>
          </div>
        );

      case 'text':
        return (
          <div>
            <label className="block text-sm font-semibold text-[#003300] mb-2">
              {param.name} {param.required && <span className="text-red-500">*</span>}
            </label>
            {param.description && (
              <p className="text-xs text-[#003300]/60 mb-2">{param.description}</p>
            )}
            <textarea
              value={value || ''}
              onChange={(e) => handleParameterChange(param.name, e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-[#003300]/20 rounded-xl text-[#003300] placeholder:text-[#003300]/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Enter your response..."
              required={param.required}
            />
          </div>
        );

      case 'grade':
        return (
          <div>
            <label className="block text-sm font-semibold text-[#003300] mb-2">
              {param.name} {param.required && <span className="text-red-500">*</span>}
            </label>
            {param.description && (
              <p className="text-xs text-[#003300]/60 mb-2">{param.description}</p>
            )}
            <select
              value={value || ''}
              onChange={(e) => handleParameterChange(param.name, e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#003300]/20 rounded-xl text-[#003300] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required={param.required}
            >
              <option value="">Select grade...</option>
              <option value="A">A - Excellent</option>
              <option value="B">B - Good</option>
              <option value="C">C - Satisfactory</option>
              <option value="D">D - Needs Improvement</option>
              <option value="F">F - Unsatisfactory</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  if (loadingCriteria) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-[#003300]/20 shadow-lg p-6"
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader className="w-6 h-6 text-emerald-500 animate-spin" />
          <span className="text-[#003300]">Loading evaluation criteria...</span>
        </div>
      </motion.div>
    );
  }

  if (criteriaError || !criteria) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-[#003300]/20 shadow-lg p-6"
      >
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#003300] mb-2">No Evaluation Criteria</h3>
          <p className="text-[#003300]/60 mb-6">
            {criteriaError || 'No evaluation criteria has been configured for this group.'}
          </p>
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-[#003300]/20 text-[#003300] font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-[#003300]/20 shadow-lg p-6 space-y-6 max-h-[80vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#003300]/10">
        <div>
          <h3 className="text-xl font-bold text-[#003300]">{studentName}</h3>
          <p className="text-sm text-[#003300]/60">{criteria.name}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-[#003300]/60" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating (if enabled) */}
        {criteria.includeOverallRating && (
          <div>
            <RatingInput
              label="Overall Performance"
              value={formData.overallRating}
              onChange={(rating) => setFormData({ ...formData, overallRating: rating })}
              min={criteria.overallRatingScale?.min || 1}
              max={criteria.overallRatingScale?.max || 5}
              required
              size="lg"
            />
          </div>
        )}

        {/* Dynamic Parameters */}
        {criteria.parameters
          .sort((a, b) => a.order - b.order)
          .map((param, index) => (
            <div key={index}>
              {renderParameterInput(param)}
            </div>
          ))}

        {/* Comments (if enabled) */}
        {criteria.includeComments && (
          <div>
            <label className="block text-sm font-semibold text-[#003300] mb-2">
              Comments {criteria.requireComments && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData.trainerNotes}
              onChange={(e) => setFormData({ ...formData, trainerNotes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white border border-[#003300]/20 rounded-xl text-[#003300] placeholder:text-[#003300]/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Add your notes and observations..."
              required={criteria.requireComments}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#003300]/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-[#003300]/20 text-[#003300] font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : 'Save Evaluation'}
          </button>
        </div>
      </form>

      {/* Quick Info */}
      <div className="pt-4 border-t border-[#003300]/10 text-xs text-[#003300]/60">
        <p>💡 Tip: You can add more details later by editing this evaluation</p>
      </div>
    </motion.div>
  );
};
