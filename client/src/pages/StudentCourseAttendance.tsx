import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAttendance } from "../hooks";
import {
  CardComponent,
  CardBody,
  Button,
  Badge,
  LoadingState,
  Alert,
} from "../components/ui";

export default function StudentCourseAttendance() {
  const { courseId } = useParams<{ courseId: string }>();
  const { attendance, stats, isLoading, error, refetch } = useAttendance(courseId!);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    if (percentage >= 90) return "success";
    if (percentage >= 75) return "primary";
    if (percentage >= 60) return "warning";
    return "error";
  };

  // Filter attendance by selected month
  const filteredAttendance = attendance.filter((record) => {
    const recordDate = new Date(record.session.date);
    return (
      recordDate.getMonth() === selectedMonth &&
      recordDate.getFullYear() === selectedYear
    );
  });

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading attendance..." />;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <Link to="/student/attendance">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Attendance Overview
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Course Attendance Details</h1>
        <p className="text-white/60">Detailed attendance record for this course</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Attendance Rate</p>
                <p className="text-3xl font-bold">
                  {Math.round(stats?.attendancePercentage || 0)}%
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full bg-${getAttendancePercentageColor(stats?.attendancePercentage || 0)}/20 flex items-center justify-center`}>
                <TrendingUp className={`w-8 h-8 text-${getAttendancePercentageColor(stats?.attendancePercentage || 0)}`} />
              </div>
            </div>
            <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats?.attendancePercentage || 0}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`h-full bg-gradient-to-r from-${getAttendancePercentageColor(stats?.attendancePercentage || 0)} to-${getAttendancePercentageColor(stats?.attendancePercentage || 0)}-dark rounded-full`}
              />
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Present</p>
                <p className="text-3xl font-bold text-success">
                  {stats?.presentCount || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Late</p>
                <p className="text-3xl font-bold text-warning">
                  {stats?.lateCount || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Absent</p>
                <p className="text-3xl font-bold text-error">
                  {stats?.absentCount || 0}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-error" />
            </div>
          </CardBody>
        </CardComponent>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Session History</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary"
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance List */}
      <CardComponent variant="glass">
        <CardBody>
          {filteredAttendance.length > 0 ? (
            <div className="space-y-3">
              {filteredAttendance.map((record, index) => (
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
                    <div className="flex items-center gap-2 mb-1">
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
                    <div className="flex items-center gap-4 text-sm text-white/60">
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
          ) : (
            <div className="text-center py-12 text-white/40">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No attendance records for this month</p>
            </div>
          )}
        </CardBody>
      </CardComponent>

      {/* Legend */}
      <CardComponent variant="glass">
        <CardBody>
          <h3 className="text-sm font-semibold mb-3">Status Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-info" />
              <span className="text-sm">Excused</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-error" />
              <span className="text-sm">Absent</span>
            </div>
          </div>
        </CardBody>
      </CardComponent>
    </motion.div>
  );
}
