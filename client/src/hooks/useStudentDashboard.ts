import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface DashboardStats {
  totalEnrolledCourses: number;
  activeCourses: number;
  completedCourses: number;
  totalModulesCompleted: number;
  averageProgress: number;
  averageAttendance: number;
  totalPaid: number;
  totalRemaining: number;
  overduePayments: number;
  averageQuizScore: number | null;
  totalQuizzesTaken: number;
  totalAssignmentsSubmitted: number;
  pendingAssignments: number;
}

export interface RecentActivity {
  _id: string;
  type: 'module' | 'quiz' | 'assignment' | 'payment' | 'attendance';
  title: string;
  description: string;
  courseTitle: string;
  timestamp: string;
  status?: 'completed' | 'in_progress' | 'graded' | 'submitted';
  icon?: string;
}

export interface UpcomingDeadline {
  _id: string;
  type: 'assignment' | 'payment' | 'quiz';
  title: string;
  courseTitle: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
}

export interface CourseProgressOverview {
  courseId: string;
  courseTitle: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  status: 'active' | 'completed';
}

interface UseStudentDashboardReturn {
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  upcomingDeadlines: UpcomingDeadline[];
  progressOverview: CourseProgressOverview[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStudentDashboard = (): UseStudentDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [progressOverview, setProgressOverview] = useState<CourseProgressOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsRes, activityRes, deadlinesRes, progressRes] = await Promise.all([
        api.get('/student/dashboard/stats'),
        api.get('/student/dashboard/recent-activity'),
        api.get('/student/dashboard/upcoming-deadlines'),
        api.get('/student/dashboard/progress'),
      ]);

      setStats(statsRes.data.data || null);
      setRecentActivity(activityRes.data.data || []);
      setUpcomingDeadlines(deadlinesRes.data.data || []);
      setProgressOverview(progressRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    recentActivity,
    upcomingDeadlines,
    progressOverview,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
};
