import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface EnrolledCourse {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail?: string;
    instructor: {
      _id: string;
      name: string;
      email: string;
    };
    startDate?: string;
    endDate?: string;
    duration: string;
  };
  status: 'active' | 'completed' | 'dropped';
  progress: {
    percentageComplete: number;
    completedModules: string[];
    currentModule?: string;
  };
  payment: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  };
  attendance: {
    percentage: number;
    totalSessions: number;
    attendedSessions: number;
  };
  enrolledAt: string;
  completedAt?: string;
}

interface UseStudentCoursesReturn {
  courses: EnrolledCourse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStudentCourses = (): UseStudentCoursesReturn => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/student/courses');
      setCourses(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
      console.error('Error fetching student courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses,
  };
};
