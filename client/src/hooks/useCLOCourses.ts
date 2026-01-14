import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface CourseStats {
  totalGroups: number;
  activeGroups: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  trainersCount: number;
}

export interface Course {
  _id: string;
  title: string;
  description?: string;
  category: string;
  level?: string;
  duration?: number;
  price?: number;
  instructor?: {
    _id: string;
    name: string;
    email: string;
  };
  thumbnail?: string;
  syllabus?: any[];
  objectives?: string[];
  prerequisites?: string[];
  status: string;
  stats?: CourseStats;
  createdAt: string;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  category: string;
  level?: string;
  duration?: number;
  price?: number;
  instructor?: string;
  thumbnail?: string;
  syllabus?: any[];
  objectives?: string[];
  prerequisites?: string[];
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: number;
  price?: number;
  instructor?: string;
  thumbnail?: string;
  syllabus?: any[];
  objectives?: string[];
  prerequisites?: string[];
  status?: string;
}

interface UseCLOCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: (params?: {
    status?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    order?: string;
  }) => Promise<void>;
  getCourseDetails: (id: string) => Promise<any>;
  createCourse: (data: CreateCourseData) => Promise<Course>;
  updateCourse: (id: string, data: UpdateCourseData) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  archiveCourse: (id: string, action?: 'archive' | 'unarchive') => Promise<void>;
  getCourseStatistics: (id: string, period?: number) => Promise<any>;
}

export const useCLOCourses = (): UseCLOCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (params?: {
    status?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    order?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.order) queryParams.append('order', params.order);

      const response = await api.get(`/clo/courses?${queryParams.toString()}`);
      setCourses(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCourseDetails = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await api.get(`/clo/courses/${id}`);
      return response.data.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch course details';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const createCourse = useCallback(async (data: CreateCourseData): Promise<Course> => {
    try {
      setError(null);
      const response = await api.post('/clo/courses', data);
      const newCourse = response.data.data;
      setCourses(prev => [newCourse, ...prev]);
      return newCourse;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create course';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const updateCourse = useCallback(async (id: string, data: UpdateCourseData): Promise<Course> => {
    try {
      setError(null);
      const response = await api.put(`/clo/courses/${id}`, data);
      const updatedCourse = response.data.data;
      setCourses(prev => prev.map(c => c._id === id ? updatedCourse : c));
      return updatedCourse;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update course';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const deleteCourse = useCallback(async (id: string) => {
    try {
      setError(null);
      await api.delete(`/clo/courses/${id}`);
      // Remove from local state
      setCourses(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete course';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const archiveCourse = useCallback(async (id: string, action: 'archive' | 'unarchive' = 'archive') => {
    try {
      setError(null);
      await api.put(`/clo/courses/${id}/archive`, { action });
      // Update local state
      setCourses(prev => prev.map(c => {
        if (c._id === id) {
          return {
            ...c,
            status: action === 'archive' ? 'archived' : 'published'
          };
        }
        return c;
      }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update course status';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const getCourseStatistics = useCallback(async (id: string, period: number = 30) => {
    try {
      setError(null);
      const response = await api.get(`/clo/courses/${id}/statistics?period=${period}`);
      return response.data.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch course statistics';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
    getCourseDetails,
    createCourse,
    updateCourse,
    deleteCourse,
    archiveCourse,
    getCourseStatistics,
  };
};
