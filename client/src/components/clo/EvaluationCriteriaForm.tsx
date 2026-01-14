/**
 * Evaluation Criteria Form Component
 *
 * Modal form for creating and editing evaluation criteria
 * Allows CLO to configure dynamic evaluation parameters
 *
 * @component EvaluationCriteriaForm
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Users,
  Star,
  BarChart3,
  FileText,
  CheckCircle,
  GripVertical,
  AlertCircle
} from 'lucide-react';
import Modal from '../ui/Modal';
import { Button, Badge, Alert, Input } from '../ui';
import { api } from '../../lib/api';

interface Parameter {
  name: string;
  description: string;
  type: 'rating' | 'percentage' | 'grade' | 'boolean' | 'text';
  ratingScale?: {
    min: number;
    max: number;
  };
  weight: number;
  required: boolean;
  order: number;
}

interface FormData {
  name: string;
  description: string;
  appliesTo: 'course' | 'groups';
  courseId: string;
  groupIds: string[];
  parameters: Parameter[];
  includeOverallRating: boolean;
  overallRatingScale: {
    min: number;
    max: number;
  };
  includeComments: boolean;
  requireComments: boolean;
}

interface EvaluationCriteriaFormProps {
  criteriaId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EvaluationCriteriaForm({
  criteriaId,
  onClose,
  onSuccess
}: EvaluationCriteriaFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    appliesTo: 'course',
    courseId: '',
    groupIds: [],
    parameters: [],
    includeOverallRating: true,
    overallRatingScale: { min: 1, max: 5 },
    includeComments: true,
    requireComments: false
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    if (criteriaId) {
      fetchCriteria();
    }
  }, [criteriaId]);

  useEffect(() => {
    if (formData.courseId) {
      fetchGroups(formData.courseId);
    }
  }, [formData.courseId]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/clo/courses', { params: { status: 'published' } });
      setCourses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchGroups = async (courseId: string) => {
    try {
      const response = await api.get('/clo/groups', { params: { courseId, status: 'active' } });
      setGroups(response.data.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchCriteria = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/clo/evaluation-criteria/${criteriaId}`);
      const data = response.data.data;
      setFormData({
        name: data.name,
        description: data.description || '',
        appliesTo: data.appliesTo,
        courseId: data.courseId._id,
        groupIds: data.groupIds?.map((g: any) => g._id) || [],
        parameters: data.parameters || [],
        includeOverallRating: data.includeOverallRating,
        overallRatingScale: data.overallRatingScale || { min: 1, max: 5 },
        includeComments: data.includeComments,
        requireComments: data.requireComments
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load criteria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.courseId) {
      setError('Course is required');
      return;
    }
    if (formData.appliesTo === 'groups' && formData.groupIds.length === 0) {
      setError('At least one group must be selected');
      return;
    }
    if (formData.parameters.length === 0) {
      setError('At least one evaluation parameter is required');
      return;
    }

    // Check if weights sum to 100 if any weight is set
    const totalWeight = formData.parameters.reduce((sum, p) => sum + (p.weight || 0), 0);
    if (totalWeight > 0 && totalWeight !== 100) {
      setError(`Parameter weights must sum to 100% (current: ${totalWeight}%)`);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        ...formData,
        groupIds: formData.appliesTo === 'groups' ? formData.groupIds : []
      };

      if (criteriaId) {
        await api.put(`/clo/evaluation-criteria/${criteriaId}`, payload);
      } else {
        await api.post('/clo/evaluation-criteria', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save criteria');
    } finally {
      setIsSaving(false);
    }
  };

  const addParameter = () => {
    setFormData(prev => ({
      ...prev,
      parameters: [
        ...prev.parameters,
        {
          name: '',
          description: '',
          type: 'rating',
          ratingScale: { min: 1, max: 5 },
          weight: 0,
          required: true,
          order: prev.parameters.length
        }
      ]
    }));
  };

  const updateParameter = (index: number, field: keyof Parameter, value: any) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const removeParameter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };

  const totalWeight = formData.parameters.reduce((sum, p) => sum + (p.weight || 0), 0);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={criteriaId ? 'Edit Evaluation Criteria' : 'Create Evaluation Criteria'}
      description="Configure dynamic evaluation parameters for courses and groups"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="error">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </Alert>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#003300] border-b border-[#003300]/10 pb-2">
            Basic Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-[#003300] mb-1">
              Criteria Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Robotics Workshop Evaluation"
              leftIcon={<FileText className="w-4 h-4" />}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#003300] mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] placeholder:text-[#003300]/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              placeholder="Optional description..."
            />
          </div>
        </div>

        {/* Application Scope */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#003300] border-b border-[#003300]/10 pb-2">
            Application Scope
          </h3>

          <div>
            <label className="block text-sm font-medium text-[#003300] mb-1">
              Course <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#003300]/40" />
              <select
                value={formData.courseId}
                onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value, groupIds: [] }))}
                className="w-full pl-10 px-4 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                required
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#003300] mb-2">
              Applies To <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, appliesTo: 'course', groupIds: [] }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.appliesTo === 'course'
                    ? 'border-emerald-500 bg-emerald-50 text-[#003300]'
                    : 'border-[#003300]/20 bg-white text-[#003300]/60 hover:border-[#003300]/30'
                }`}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Entire Course</div>
                <div className="text-xs mt-1">All groups in this course</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, appliesTo: 'groups' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.appliesTo === 'groups'
                    ? 'border-emerald-500 bg-emerald-50 text-[#003300]'
                    : 'border-[#003300]/20 bg-white text-[#003300]/60 hover:border-[#003300]/30'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Specific Groups</div>
                <div className="text-xs mt-1">Select individual groups</div>
              </button>
            </div>
          </div>

          {formData.appliesTo === 'groups' && (
            <div>
              <label className="block text-sm font-medium text-[#003300] mb-2">
                Select Groups <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border border-[#003300]/10 rounded-lg bg-gray-50">
                {groups.map(group => (
                  <label
                    key={group._id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      formData.groupIds.includes(group._id)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-[#003300]/10 bg-white hover:border-[#003300]/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.groupIds.includes(group._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            groupIds: [...prev.groupIds, group._id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            groupIds: prev.groupIds.filter(id => id !== group._id)
                          }));
                        }
                      }}
                      className="rounded border-[#003300]/20 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-[#003300]">{group.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Evaluation Parameters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#003300]/10 pb-2">
            <div>
              <h3 className="text-lg font-semibold text-[#003300]">Evaluation Parameters</h3>
              {totalWeight > 0 && (
                <p className={`text-sm mt-1 ${totalWeight === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                  Total Weight: {totalWeight}% {totalWeight !== 100 && '(Must be 100%)'}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={addParameter}
            >
              Add Parameter
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {formData.parameters.map((param, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 border border-[#003300]/10 rounded-lg space-y-3"
              >
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-[#003300]/40 mt-2 flex-shrink-0" />

                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#003300]/70 mb-1">
                        Parameter Name
                      </label>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] text-sm placeholder:text-[#003300]/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        placeholder="e.g., Technical Skills"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#003300]/70 mb-1">
                        Type
                      </label>
                      <select
                        value={param.type}
                        onChange={(e) => updateParameter(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        <option value="rating">Rating Scale</option>
                        <option value="percentage">Percentage</option>
                        <option value="grade">Grade (A-F)</option>
                        <option value="boolean">Yes/No</option>
                        <option value="text">Text</option>
                      </select>
                    </div>

                    {param.type === 'rating' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-[#003300]/70 mb-1">
                            Min Rating
                          </label>
                          <input
                            type="number"
                            value={param.ratingScale?.min || 1}
                            onChange={(e) => updateParameter(index, 'ratingScale', {
                              ...param.ratingScale,
                              min: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#003300]/70 mb-1">
                            Max Rating
                          </label>
                          <input
                            type="number"
                            value={param.ratingScale?.max || 5}
                            onChange={(e) => updateParameter(index, 'ratingScale', {
                              ...param.ratingScale,
                              max: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            min="1"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-[#003300]/70 mb-1">
                        Weight (%)
                      </label>
                      <input
                        type="number"
                        value={param.weight}
                        onChange={(e) => updateParameter(index, 'weight', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={param.required}
                          onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                          className="rounded border-[#003300]/20 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-[#003300]">Required</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeParameter(index)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#003300]/70 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={param.description}
                    onChange={(e) => updateParameter(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] text-sm placeholder:text-[#003300]/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    placeholder="Additional context for this parameter..."
                  />
                </div>
              </div>
            ))}

            {formData.parameters.length === 0 && (
              <div className="text-center py-8 text-[#003300]/40 bg-gray-50 rounded-lg border border-dashed border-[#003300]/20">
                No parameters added yet. Click "Add Parameter" to get started.
              </div>
            )}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#003300] border-b border-[#003300]/10 pb-2">
            Additional Options
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-[#003300]/10">
              <input
                type="checkbox"
                checked={formData.includeOverallRating}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  includeOverallRating: e.target.checked
                }))}
                className="mt-0.5 rounded border-[#003300]/20 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="text-[#003300] font-medium">Include Overall Rating</div>
                <div className="text-sm text-[#003300]/60">Add a separate overall rating field</div>
              </div>
            </label>

            {formData.includeOverallRating && (
              <div className="ml-8 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#003300]/70 mb-1">
                    Min Rating
                  </label>
                  <input
                    type="number"
                    value={formData.overallRatingScale.min}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      overallRatingScale: {
                        ...prev.overallRatingScale,
                        min: parseInt(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#003300]/70 mb-1">
                    Max Rating
                  </label>
                  <input
                    type="number"
                    value={formData.overallRatingScale.max}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      overallRatingScale: {
                        ...prev.overallRatingScale,
                        max: parseInt(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    min="1"
                  />
                </div>
              </div>
            )}

            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-[#003300]/10">
              <input
                type="checkbox"
                checked={formData.includeComments}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  includeComments: e.target.checked,
                  requireComments: e.target.checked ? prev.requireComments : false
                }))}
                className="mt-0.5 rounded border-[#003300]/20 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="text-[#003300] font-medium">Include Comments Field</div>
                <div className="text-sm text-[#003300]/60">Allow trainers to add notes</div>
              </div>
            </label>

            {formData.includeComments && (
              <label className="flex items-start gap-3 p-3 ml-8 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-[#003300]/10">
                <input
                  type="checkbox"
                  checked={formData.requireComments}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requireComments: e.target.checked
                  }))}
                  className="mt-0.5 rounded border-[#003300]/20 text-emerald-500 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="text-[#003300] font-medium">Require Comments</div>
                  <div className="text-sm text-[#003300]/60">Make comments mandatory</div>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#003300]/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Saving...' : criteriaId ? 'Update Criteria' : 'Create Criteria'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
