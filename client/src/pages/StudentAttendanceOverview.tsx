import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { useAttendanceOverview } from "../hooks";
import {
  CardComponent,
  CardBody,
  Button,
  Badge,
  LoadingState,
  Alert,
} from "../components/ui";

export default function StudentAttendanceOverview() {
  const { data, isLoading, error, refetch } = useAttendanceOverview();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "late":
        return <Clock className="w-5 h-5 text-warning" />;
      case "excused":
        return <AlertTriangle className="w-5 h-5 text-info" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "late":
        return "warning";
      case "excused":
        return "info";
      case "absent":
        return "error";
      default:
        return "secondary";
    }
  };

  const getAttendancePercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 75) return "text-primary";
    if (percentage >= 60) return "text-warning";
    return "text-error";
  };

  const getAttendanceBgColor = (percentage: number) => {
    if (percentage >= 90) return "bg-success/20";
    if (percentage >= 75) return "bg-primary/20";
    if (percentage >= 60) return "bg-warning/20";
    return "bg-error/20";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading attendance data..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load attendance</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={refetch}
            >
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const overallStats = data?.overallStats;
  const courses = data?.courses || [];
  const recentAttendance = data?.recentAttendance || [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Attendance Overview
        </h1>
        <p className="mt-2 text-white/60">
          Track your attendance across all enrolled courses
        </p>
      </motion.div>

      {/* Overall Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Average Attendance */}
        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Average Attendance</p>
                <p className={`text-3xl font-bold ${getAttendancePercentageColor(overallStats?.averageAttendance || 0)}`}>
                  {overallStats?.averageAttendance || 0}%
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full ${getAttendanceBgColor(overallStats?.averageAttendance || 0)} flex items-center justify-center`}>
                <TrendingUp className={`w-8 h-8 ${getAttendancePercentageColor(overallStats?.averageAttendance || 0)}`} />
              </div>
            </div>
            <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallStats?.averageAttendance || 0}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`h-full rounded-full ${
                  (overallStats?.averageAttendance || 0) >= 90
                    ? "bg-gradient-to-r from-success to-success-dark"
                    : (overallStats?.averageAttendance || 0) >= 75
                    ? "bg-gradient-to-r from-primary to-accent"
                    : (overallStats?.averageAttendance || 0) >= 60
                    ? "bg-gradient-to-r from-warning to-warning-dark"
                    : "bg-gradient-to-r from-error to-error-dark"
                }`}
              />
            </div>
          </CardBody>
        </CardComponent>

        {/* Total Present */}
        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Present</p>
                <p className="text-3xl font-bold text-success">
                  {overallStats?.totalPresent || 0}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  out of {overallStats?.totalSessions || 0} sessions
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardBody>
        </CardComponent>

        {/* Total Late */}
        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Late</p>
                <p className="text-3xl font-bold text-warning">
                  {overallStats?.totalLate || 0}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {overallStats?.totalCourses || 0} courses
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardBody>
        </CardComponent>

        {/* Total Absent */}
        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Absent</p>
                <p className="text-3xl font-bold text-error">
                  {overallStats?.totalAbsent || 0}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  needs improvement
                </p>
              </div>
              <XCircle className="w-8 h-8 text-error" />
            </div>
          </CardBody>
        </CardComponent>
      </motion.div>

      {/* Course-wise Attendance */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-semibold mb-4">Attendance by Course</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CardComponent variant="glass" hover className="h-full">
                  <CardBody>
                    {/* Course Header */}
                    <div className="flex items-start gap-3 mb-4">
                      {course.courseThumbnail ? (
                        <img
                          src={course.courseThumbnail}
                          alt={course.courseTitle}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{course.courseTitle}</h3>
                        <p className="text-xs text-white/60">
                          {course.totalSessions} sessions
                        </p>
                      </div>
                    </div>

                    {/* Attendance Percentage */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-white/60">Attendance Rate</span>
                        <span className={`font-semibold ${getAttendancePercentageColor(course.attendancePercentage)}`}>
                          {course.attendancePercentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.attendancePercentage}%` }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                          className={`h-full rounded-full ${
                            course.attendancePercentage >= 90
                              ? "bg-gradient-to-r from-success to-success-dark"
                              : course.attendancePercentage >= 75
                              ? "bg-gradient-to-r from-primary to-accent"
                              : course.attendancePercentage >= 60
                              ? "bg-gradient-to-r from-warning to-warning-dark"
                              : "bg-gradient-to-r from-error to-error-dark"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <div>
                          <p className="text-xs text-white/40">Present</p>
                          <p className="text-sm font-semibold">{course.presentCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-warning" />
                        <div>
                          <p className="text-xs text-white/40">Late</p>
                          <p className="text-sm font-semibold">{course.lateCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-error" />
                        <div>
                          <p className="text-xs text-white/40">Absent</p>
                          <p className="text-sm font-semibold">{course.absentCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-info" />
                        <div>
                          <p className="text-xs text-white/40">Excused</p>
                          <p className="text-sm font-semibold">{course.excusedCount}</p>
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Link to={`/student/attendance/${course.courseId}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        View Details
                      </Button>
                    </Link>
                  </CardBody>
                </CardComponent>
              </motion.div>
            ))}
          </div>
        ) : (
          <CardComponent variant="glass">
            <CardBody className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-white/60 mb-6">
                You haven't enrolled in any courses yet
              </p>
              <Link to="/student/courses">
                <Button variant="primary" size="md">
                  Browse Courses
                </Button>
              </Link>
            </CardBody>
          </CardComponent>
        )}
      </motion.div>

      {/* Recent Attendance Activity */}
      {recentAttendance.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-semibold mb-4">Recent Attendance</h2>
          <CardComponent variant="glass">
            <CardBody>
              <div className="space-y-3">
                {recentAttendance.map((record, index) => (
                  <motion.div
                    key={record._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex-shrink-0">
                      {getStatusIcon(record.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold truncate">
                          {record.session.title}
                        </h3>
                        <Badge variant={getStatusColor(record.status) as any} size="sm">
                          {record.status}
                        </Badge>
                        <Badge variant="secondary" size="sm">
                          {record.session.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60 flex-wrap">
                        <span className="font-medium text-primary">
                          {record.courseTitle}
                        </span>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(record.session.date).toLocaleDateString()}
                        </div>
                        {record.session.startTime && record.session.endTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {record.session.startTime} - {record.session.endTime}
                          </div>
                        )}
                        {record.checkInTime && (
                          <div className="text-xs text-white/40">
                            Checked in: {new Date(record.checkInTime).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </CardComponent>
        </motion.div>
      )}

      {/* Status Legend */}
      <motion.div variants={itemVariants}>
        <CardComponent variant="glass">
          <CardBody>
            <h3 className="text-sm font-semibold mb-3">Status Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">Present - On time</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-sm">Late - Attended late</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-info" />
                <span className="text-sm">Excused - Valid reason</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-error" />
                <span className="text-sm">Absent - Not attended</span>
              </div>
            </div>
          </CardBody>
        </CardComponent>
      </motion.div>
    </motion.div>
  );
}
