/**
 * Custom hook for managing enrollments in reception dashboard
 *
 * Provides operations for enrollments:
 * - Fetch all enrollments with filters
 * - Create new enrollment (register student in course)
 * - Update enrollment status
 * - Get available courses, groups, and students for enrollment form
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

/**
 * Enrollment interface
 */
export interface Enrollment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
    price?: number;
  };
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  payment: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    installments: Installment[];
  };
  progress: {
    percentageComplete: number;
  };
  attendance: {
    percentage: number;
  };
  notes?: string;
}

/**
 * Installment interface
 */
export interface Installment {
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
}

/**
 * Course interface
 */
export interface Course {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category?: string;
  level?: string;
  instructor?: {
    _id: string;
    name: string;
  };
}

/**
 * Group interface
 */
export interface Group {
  _id: string;
  name?: string;
  trainerId: {
    _id: string;
    name: string;
  };
  maxStudents: number;
  students: string[];
  availableSeats: number;
  isFull: boolean;
  schedule?: any[];
}

/**
 * Student interface (simplified)
 */
export interface Student {
  _id: string;
  name: string;
  email: string;
}

/**
 * Pagination information
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Filters for enrollment search
 */
export interface EnrollmentFilters {
  course?: string;
  student?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Create enrollment request payload
 */
export interface CreateEnrollmentRequest {
  studentId: string;
  courseId: string;
  groupId?: string;
  totalAmount: number;
  installmentPlan?: {
    numberOfInstallments: number;
    startDate?: string;
  };
  notes?: string;
}

/**
 * Update enrollment request payload
 */
export interface UpdateEnrollmentRequest {
  status?: 'active' | 'completed' | 'dropped' | 'suspended';
  notes?: string;
}

/**
 * Return type for the hook
 */
interface UseReceptionEnrollmentsReturn {
  enrollments: Enrollment[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  filters: EnrollmentFilters;
  setFilters: (filters: EnrollmentFilters) => void;
  fetchEnrollments: () => Promise<void>;
  createEnrollment: (data: CreateEnrollmentRequest) => Promise<void>;
  updateEnrollment: (id: string, data: UpdateEnrollmentRequest) => Promise<void>;

  // Helper data
  availableCourses: Course[];
  availableGroups: Group[];
  availableStudents: Student[];
  fetchAvailableCourses: () => Promise<void>;
  fetchAvailableGroups: (courseId: string) => Promise<void>;
  fetchAvailableStudents: (courseId?: string) => Promise<void>;
}

/**
 * Hook to manage enrollments with CRUD operations
 *
 * @returns Enrollments list, helper data, CRUD functions, loading state, and error
 *
 * @example
 * const { enrollments, createEnrollment, availableCourses } = useReceptionEnrollments();
 */
export const useReceptionEnrollments = (): UseReceptionEnrollmentsReturn => {
  // State management
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EnrollmentFilters>({
    page: 1,
    limit: 20
  });

  // Helper data states
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  /**
   * Fetch enrollments from API with current filters
   */
  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.course) params.append('course', filters.course);
      if (filters.student) params.append('student', filters.student);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      // Fetch enrollments
      const response = await api.get(`/reception/enrollments?${params.toString()}`);

      setEnrollments(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch enrollments');
      console.error('Error fetching enrollments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Create a new enrollment
   */
  const createEnrollment = useCallback(async (data: CreateEnrollmentRequest) => {
    try {
      setError(null);

      await api.post('/reception/enrollments', data);

      // Refresh enrollment list
      await fetchEnrollments();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create enrollment';
      setError(errorMessage);
      console.error('Error creating enrollment:', err);
      throw new Error(errorMessage);
    }
  }, [fetchEnrollments]);

  /**
   * Update an enrollment
   */
  const updateEnrollment = useCallback(async (id: string, data: UpdateEnrollmentRequest) => {
    try {
      setError(null);

      await api.put(`/reception/enrollments/${id}`, data);

      // Refresh enrollment list
      await fetchEnrollments();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update enrollment';
      setError(errorMessage);
      console.error('Error updating enrollment:', err);
      throw new Error(errorMessage);
    }
  }, [fetchEnrollments]);

  /**
   * Record a payment for an enrollment
   */
  const recordPayment = useCallback(async (
    id: string,
    amount: number,
    paymentMethod: string = 'cash',
    notes: string = ''
  ) => {
    try {
      setError(null);

      const response = await api.post(`/reception/enrollments/${id}/payment`, {
        amount,
        paymentMethod,
        notes
      });

      // Refresh enrollment list
      await fetchEnrollments();

      // Return receipt data if available
      return response.data.receipt || null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to record payment';
      setError(errorMessage);
      console.error('Error recording payment:', err);
      throw new Error(errorMessage);
    }
  }, [fetchEnrollments]);

  /**
   * Download receipt PDF
   */
  const downloadReceipt = useCallback(async (receiptId: string, receiptNumber: string) => {
    try {
      const response = await api.get(`/reception/receipts/${receiptId}/download`, {
        responseType: 'blob'
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to download receipt';
      setError(errorMessage);
      console.error('Error downloading receipt:', err);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Fetch available courses
   */
  const fetchAvailableCourses = useCallback(async () => {
    try {
      const response = await api.get('/reception/enrollments/available-courses');
      setAvailableCourses(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching available courses:', err);
    }
  }, []);

  /**
   * Fetch available groups for a course
   */
  const fetchAvailableGroups = useCallback(async (courseId: string) => {
    try {
      const response = await api.get(`/reception/enrollments/available-groups/${courseId}`);
      setAvailableGroups(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching available groups:', err);
      setAvailableGroups([]);
    }
  }, []);

  /**
   * Fetch available students (optionally filter by course to exclude enrolled)
   */
  const fetchAvailableStudents = useCallback(async (courseId?: string) => {
    try {
      const params = courseId ? `?courseId=${courseId}` : '';
      const response = await api.get(`/reception/enrollments/available-students${params}`);
      setAvailableStudents(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching available students:', err);
      setAvailableStudents([]);
    }
  }, []);

  /**
   * Fetch enrollments when filters change
   */
  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    fetchEnrollments,
    createEnrollment,
    updateEnrollment,
    recordPayment,
    downloadReceipt,
    availableCourses,
    availableGroups,
    availableStudents,
    fetchAvailableCourses,
    fetchAvailableGroups,
    fetchAvailableStudents,
  };
};
