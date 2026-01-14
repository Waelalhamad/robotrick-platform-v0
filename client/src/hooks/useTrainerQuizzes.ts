import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface QuizQuestion {
  question: string;
  type: 'single' | 'multiple';
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  points: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  course: {
    _id: string;
    title: string;
    category?: string;
  };
  module?: {
    _id: string;
    title: string;
    order: number;
  };
  title: string;
  description?: string;
  instructions?: string;
  passingScore: number;
  timeLimit?: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showFeedback: boolean;
  questions: QuizQuestion[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizData {
  courseId: string;
  moduleId?: string;
  title: string;
  description?: string;
  instructions?: string;
  passingScore?: number;
  timeLimit?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showFeedback?: boolean;
  questions: QuizQuestion[];
}

export const useTrainerQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all quizzes
   */
  const fetchQuizzes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/trainer/quizzes');
      setQuizzes(response.data.data || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch quizzes';
      setError(errorMsg);
      console.error('Error fetching quizzes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch quizzes for a specific course
   */
  const fetchCourseQuizzes = useCallback(async (courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/trainer/quizzes/course/${courseId}`);
      setQuizzes(response.data.data || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch course quizzes';
      setError(errorMsg);
      console.error('Error fetching course quizzes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get quiz by ID
   */
  const getQuizById = useCallback(async (quizId: string): Promise<Quiz | null> => {
    try {
      const response = await api.get(`/trainer/quizzes/${quizId}`);
      return response.data.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch quiz';
      setError(errorMsg);
      console.error('Error fetching quiz:', err);
      return null;
    }
  }, []);

  /**
   * Create a new quiz
   */
  const createQuiz = useCallback(async (quizData: CreateQuizData): Promise<Quiz | null> => {
    try {
      const response = await api.post('/trainer/quizzes', quizData);
      const newQuiz = response.data.data;

      // Add to local state
      setQuizzes(prev => [newQuiz, ...prev]);

      return newQuiz;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create quiz';
      setError(errorMsg);
      console.error('Error creating quiz:', err);
      return null;
    }
  }, []);

  /**
   * Update quiz
   */
  const updateQuiz = useCallback(async (quizId: string, quizData: Partial<CreateQuizData>): Promise<Quiz | null> => {
    try {
      const response = await api.put(`/trainer/quizzes/${quizId}`, quizData);
      const updatedQuiz = response.data.data;

      // Update in local state
      setQuizzes(prev => prev.map(q => q._id === quizId ? updatedQuiz : q));

      return updatedQuiz;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update quiz';
      setError(errorMsg);
      console.error('Error updating quiz:', err);
      return null;
    }
  }, []);

  /**
   * Delete quiz
   */
  const deleteQuiz = useCallback(async (quizId: string): Promise<boolean> => {
    try {
      await api.delete(`/trainer/quizzes/${quizId}`);

      // Remove from local state
      setQuizzes(prev => prev.filter(q => q._id !== quizId));

      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete quiz';
      setError(errorMsg);
      console.error('Error deleting quiz:', err);
      return false;
    }
  }, []);

  /**
   * Duplicate quiz
   */
  const duplicateQuiz = useCallback(async (quizId: string): Promise<Quiz | null> => {
    try {
      const response = await api.post(`/trainer/quizzes/${quizId}/duplicate`);
      const duplicatedQuiz = response.data.data;

      // Add to local state
      setQuizzes(prev => [duplicatedQuiz, ...prev]);

      return duplicatedQuiz;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to duplicate quiz';
      setError(errorMsg);
      console.error('Error duplicating quiz:', err);
      return null;
    }
  }, []);

  return {
    quizzes,
    isLoading,
    error,
    fetchQuizzes,
    fetchCourseQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    duplicateQuiz,
  };
};
