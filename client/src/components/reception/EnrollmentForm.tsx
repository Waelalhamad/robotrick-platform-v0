/**
 * EnrollmentForm Component
 *
 * Multi-step form for enrolling students in courses:
 * - Step 1: Select student
 * - Step 2: Select course
 * - Step 3: Select group (optional)
 * - Step 4: Set payment plan
 * - Form validation and error handling
 *
 * UPDATED: Light mode with brand colors (dark green & cream)
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import type { Course, Group, Student, CreateEnrollmentRequest } from '../../hooks/useReceptionEnrollments';

/**
 * Props for EnrollmentForm component
 */
interface EnrollmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEnrollmentRequest) => Promise<void>;
  availableCourses: Course[];
  availableGroups: Group[];
  availableStudents: Student[];
  onCourseSelect: (courseId: string) => void;
  onStudentSearch: (courseId?: string) => void;
}

/**
 * Form data interface
 */
interface FormData {
  studentId: string;
  courseId: string;
  groupId: string;
  totalAmount: string;
  numberOfInstallments: string;
  notes: string;
}

/**
 * Form errors interface
 */
interface FormErrors {
  studentId?: string;
  courseId?: string;
  totalAmount?: string;
  numberOfInstallments?: string;
}

/**
 * EnrollmentForm Component
 */
export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableCourses,
  availableGroups,
  availableStudents,
  onCourseSelect,
  onStudentSearch,
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    studentId: '',
    courseId: '',
    groupId: '',
    totalAmount: '',
    numberOfInstallments: '1',
    notes: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current step (1-4)
  const [currentStep, setCurrentStep] = useState(1);

  /**
   * Reset form when modal opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      setFormData({
        studentId: '',
        courseId: '',
        groupId: '',
        totalAmount: '',
        numberOfInstallments: '1',
        notes: '',
      });
      setErrors({});
      setCurrentStep(1);
      onStudentSearch(); // Load all students initially
    }
  }, [isOpen]); // Remove onStudentSearch from dependencies

  /**
   * Handle course selection
   */
  useEffect(() => {
    if (formData.courseId) {
      // Fetch groups for selected course
      onCourseSelect(formData.courseId);

      // Fetch students not enrolled in this course
      onStudentSearch(formData.courseId);

      // Auto-fill price from course
      const selectedCourse = availableCourses.find(c => c._id === formData.courseId);
      if (selectedCourse && selectedCourse.price && !formData.totalAmount) {
        setFormData(prev => ({ ...prev, totalAmount: selectedCourse.price.toString() }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.courseId]); // Only depend on courseId to prevent infinite loops

  /**
   * Validate current step
   */
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      // Validate student selection
      if (!formData.studentId) {
        newErrors.studentId = 'Please select a student';
      }
    } else if (step === 2) {
      // Validate course selection
      if (!formData.courseId) {
        newErrors.courseId = 'Please select a course';
      }
    } else if (step === 4) {
      // Validate payment details
      if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
        newErrors.totalAmount = 'Please enter a valid amount';
      }
      const installments = parseInt(formData.numberOfInstallments);
      if (!installments || installments < 1 || installments > 12) {
        newErrors.numberOfInstallments = 'Number of installments must be between 1 and 12';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  /**
   * Handle previous step
   */
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate final step
    if (!validateStep(4)) {
      return;
    }

    try {
      setIsSubmitting(true);

      const enrollmentData: CreateEnrollmentRequest = {
        studentId: formData.studentId,
        courseId: formData.courseId,
        groupId: formData.groupId || undefined,
        totalAmount: parseFloat(formData.totalAmount),
        installmentPlan: {
          numberOfInstallments: parseInt(formData.numberOfInstallments),
          startDate: new Date().toISOString(),
        },
        notes: formData.notes || undefined,
      };

      await onSubmit(enrollmentData);
      onClose();
    } catch (error: any) {
      // Show error message to user
      const errorMessage = error.message || 'Failed to create enrollment';
      alert(errorMessage);

      // If it's a duplicate enrollment error, go back to step 1 to select different student/course
      if (errorMessage.includes('already enrolled')) {
        setCurrentStep(1);
        setErrors({ studentId: 'This student is already enrolled in this course. Please select a different student or course.' });
      } else {
        setErrors({ totalAmount: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  /**
   * Get selected student name
   */
  const getSelectedStudentName = () => {
    const student = availableStudents.find(s => s._id === formData.studentId);
    return student ? student.name : '';
  };

  /**
   * Get selected course name
   */
  const getSelectedCourseName = () => {
    const course = availableCourses.find(c => c._id === formData.courseId);
    return course ? course.title : '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enroll Student in Course"
      description={`Step ${currentStep} of 4`}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === currentStep
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                    : step < currentStep
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : 'bg-gray-200 text-[#003300]/40'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Student */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Select Student</h3>

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-zinc-700 mb-2">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                disabled={isSubmitting || availableStudents.length === 0}
                className={`w-full px-4 py-2 rounded-lg bg-white border ${
                  errors.studentId ? 'border-red-500' : 'border-zinc-300'
                } text-zinc-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors`}
              >
                <option value="">
                  {availableStudents.length === 0
                    ? '-- Loading students... --'
                    : '-- Select a student --'}
                </option>
                {availableStudents.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
              {availableStudents.length === 0 && !isSubmitting && (
                <p className="text-yellow-600 text-sm mt-1">
                  No students available. Please create student accounts first or convert leads to students.
                </p>
              )}
              {errors.studentId && (
                <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select Course */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#003300]">Select Course</h3>

            <div>
              <label htmlFor="courseId" className="block text-sm font-medium text-[#003300] mb-2">
                Course <span className="text-red-400">*</span>
              </label>
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 rounded-lg bg-white border ${
                  errors.courseId ? 'border-red-500' : 'border-primary/20'
                } text-[#003300] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors`}
              >
                <option value="">-- Select a course --</option>
                {availableCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} {course.price ? `- $${course.price}` : ''}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <p className="text-red-400 text-sm mt-1">{errors.courseId}</p>
              )}

              {formData.courseId && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-[#003300]/70">
                    Selected: <span className="text-[#003300] font-medium">{getSelectedCourseName()}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Select Group (Optional) */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#003300]">Select Group (Optional)</h3>

            <div>
              <label htmlFor="groupId" className="block text-sm font-medium text-[#003300] mb-2">
                Group <span className="text-[#003300]/50 text-xs">(Optional)</span>
              </label>
              <select
                id="groupId"
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
                disabled={isSubmitting || availableGroups.length === 0}
                className="w-full px-4 py-2 rounded-lg bg-white border border-primary/20 text-[#003300] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="">-- No group (individual) --</option>
                {availableGroups.map((group) => (
                  <option key={group._id} value={group._id} disabled={group.isFull}>
                    {group.trainerId?.name || 'Unknown Trainer'} - {group.availableSeats} seats available
                    {group.isFull ? ' (FULL)' : ''}
                  </option>
                ))}
              </select>

              {availableGroups.length === 0 && (
                <p className="text-yellow-600 text-sm mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  No groups available for this course. Student will be enrolled individually.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Payment Plan */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#003300]">Payment Plan</h3>

            {/* Total Amount */}
            <div>
              <label htmlFor="totalAmount" className="block text-sm font-medium text-[#003300] mb-2">
                Total Amount <span className="text-red-400">*</span>
              </label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.totalAmount}
                onChange={handleChange}
                placeholder="0.00"
                disabled={isSubmitting}
                className={errors.totalAmount ? 'border-red-500' : ''}
              />
              {errors.totalAmount && (
                <p className="text-red-400 text-sm mt-1">{errors.totalAmount}</p>
              )}
            </div>

            {/* Number of Installments */}
            <div>
              <label htmlFor="numberOfInstallments" className="block text-sm font-medium text-[#003300] mb-2">
                Number of Installments <span className="text-red-400">*</span>
              </label>
              <select
                id="numberOfInstallments"
                name="numberOfInstallments"
                value={formData.numberOfInstallments}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 rounded-lg bg-white border ${
                  errors.numberOfInstallments ? 'border-red-500' : 'border-primary/20'
                } text-[#003300] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors`}
              >
                <option value="1">1 - Full payment</option>
                <option value="2">2 - Bi-monthly</option>
                <option value="3">3 - Quarterly</option>
                <option value="4">4 - Every 3 months</option>
                <option value="6">6 - Bi-monthly</option>
                <option value="12">12 - Monthly</option>
              </select>
              {errors.numberOfInstallments && (
                <p className="text-red-400 text-sm mt-1">{errors.numberOfInstallments}</p>
              )}
            </div>

            {/* Installment Preview */}
            {formData.totalAmount && parseFloat(formData.totalAmount) > 0 && (
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-sm text-cyan-700 font-medium mb-2">Payment Plan Preview:</p>
                <p className="text-[#003300]">
                  {formData.numberOfInstallments} installment(s) of{' '}
                  <span className="font-bold">
                    ${(parseFloat(formData.totalAmount) / parseInt(formData.numberOfInstallments)).toFixed(2)}
                  </span>{' '}
                  each
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-[#003300] mb-2">
                Notes <span className="text-[#003300]/50 text-xs">(Optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special notes or requirements..."
                disabled={isSubmitting}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white border border-primary/20 text-[#003300] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
              />
            </div>

            {/* Summary */}
            <div className="p-4 bg-[#f9fafb] border border-primary/20 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-[#003300] mb-2">Enrollment Summary:</p>
              <p className="text-sm text-[#003300]/70">
                Student: <span className="text-[#003300] font-medium">{getSelectedStudentName()}</span>
              </p>
              <p className="text-sm text-[#003300]/70">
                Course: <span className="text-[#003300] font-medium">{getSelectedCourseName()}</span>
              </p>
              <p className="text-sm text-[#003300]/70">
                Total: <span className="text-[#003300] font-medium">${formData.totalAmount}</span>
              </p>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-primary/10">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isSubmitting ? 'Creating...' : 'Create Enrollment'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
