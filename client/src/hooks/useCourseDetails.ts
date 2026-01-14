import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface Session {
  _id: string;
  title: string;
  description?: string;
  groupId: string;
  courseId: string;
  trainerId: {
    _id: string;
    name: string;
    email: string;
  };
  scheduledDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  sessionNumber: number;
  status: string;
  type: string;
  isLocked: boolean;
  quiz?: {
    _id: string;
    title: string;
    passingScore: number;
    timeLimit: number;
    questions: any[];
  } | null;
  createdAt: string;
}

export interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  instructor?: {
    _id: string;
    name: string;
    email: string;
  };
  duration?: string;
  price: number;
  thumbnail?: string;
  category: string;
  level: string;
  status: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  enrolledStudents: number;
}

export interface CourseProgress {
  completedModules: string[];
  currentModule?: string;
  percentageComplete: number;
}

interface UseCourseDetailsReturn {
  course: CourseDetails | null;
  sessions: Session[];
  progress: CourseProgress | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCourseDetails = (courseId: string): UseCourseDetailsReturn => {
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch course details and sessions in parallel
      const [courseRes, sessionsRes] = await Promise.all([
        api.get(`/student/courses/${courseId}`),
        api.get(`/student/courses/${courseId}/sessions`),
      ]);

      setCourse(courseRes.data.data.course);
      setSessions(sessionsRes.data.data || []);
      setProgress(courseRes.data.data.enrollment?.progress || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch course details');
      console.error('Error fetching course details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  return {
    course,
    sessions,
    progress,
    isLoading,
    error,
    refetch: fetchCourseDetails,
  };
};
