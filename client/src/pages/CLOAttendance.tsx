import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  BookOpen,
  ChevronRight,
  Calendar,
  TrendingUp,
  Clock,
  RefreshCw,
  AlertCircle,
  UserCheck,
  UserX,
  UserMinus,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useCLOAttendance } from "../hooks/useCLOAttendance";
import { useCLOCourses } from "../hooks/useCLOCourses";
import {
  Button,
  Badge,
  LoadingState,
  Alert,
} from "../components/ui";

export default function CLOAttendance() {
  const { attendanceRecords, isLoading, error, fetchAttendance } = useCLOAttendance();
  const { courses, fetchCourses } = useCLOCourses();

  // Step state: 'course' | 'session' | 'details'
  const [step, setStep] = useState<'course' | 'session' | 'details'>('course');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    fetchCourses({ status: 'published' });
  }, [fetchCourses]);

  const handleSelectCourse = async (course: any) => {
    setSelectedCourse(course);
    setStep('session');

    // Fetch attendance for this course
    setLoadingSessions(true);
    try {
      await fetchAttendance({ courseId: course._id });
      setSessions(attendanceRecords);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSelectSession = (session: any) => {
    setSelectedSession(session);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('session');
      setSelectedSession(null);
    } else if (step === 'session') {
      setStep('course');
      setSelectedCourse(null);
      setSessions([]);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "absent":
        return "error";
      case "late":
        return "warning";
      case "excused":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <UserCheck className="w-4 h-4" />;
      case "absent":
        return <UserX className="w-4 h-4" />;
      case "late":
        return <Clock className="w-4 h-4" />;
      case "excused":
        return <Shield className="w-4 h-4" />;
      default:
        return <UserMinus className="w-4 h-4" />;
    }
  };

  if (isLoading && courses.length === 0) {
    return <LoadingState type="skeleton" text="Loading courses..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#003300]/60 mb-2">
            <span className={step === 'course' ? 'text-primary font-medium' : ''}>Select Course</span>
            {(step === 'session' || step === 'details') && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className={step === 'session' ? 'text-primary font-medium' : ''}>
                  {selectedCourse?.title || 'Select Session'}
                </span>
              </>
            )}
            {step === 'details' && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-primary font-medium">Attendance Details</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold text-[#003300]">Session Attendance</h1>
          <p className="text-[#003300]/60 mt-1">
            {step === 'course' && 'Select a course to view session attendance'}
            {step === 'session' && 'Select a session to view its attendance'}
            {step === 'details' && 'View detailed attendance information'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {step !== 'course' && (
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          <Button
            variant="ghost"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              if (step === 'course') fetchCourses({ status: 'published' });
              else if (step === 'session') handleSelectCourse(selectedCourse);
              else fetchAttendance({ courseId: selectedCourse?._id });
            }}
            disabled={isLoading || loadingSessions}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Error</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        </Alert>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Course Selection */}
        {step === 'course' && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <button
                    onClick={() => handleSelectCourse(course)}
                    className="w-full bg-white rounded-xl p-6 border border-[#003300]/10 hover:border-primary/30 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white flex-shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[#003300] mb-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {course.category && (
                            <Badge variant="secondary" size="sm">
                              {course.category}
                            </Badge>
                          )}
                          {course.level && (
                            <Badge variant="secondary" size="sm" className="capitalize">
                              {course.level}
                            </Badge>
                          )}
                        </div>
                        {course.description && (
                          <p className="text-sm text-[#003300]/60 line-clamp-2 mb-3">
                            {course.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#003300]/60">
                            Click to view sessions
                          </span>
                          <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl p-12 border border-[#003300]/10 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#003300]/20" />
                <h3 className="text-lg font-semibold text-[#003300] mb-2">
                  No courses found
                </h3>
                <p className="text-[#003300]/60">
                  No published courses available
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Session Selection */}
        {step === 'session' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {loadingSessions ? (
              <LoadingState type="spinner" text="Loading sessions..." />
            ) : sessions.length > 0 ? (
              sessions.map((session, index) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <button
                    onClick={() => handleSelectSession(session)}
                    className="w-full bg-white rounded-xl p-6 border border-[#003300]/10 hover:border-primary/30 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white flex-shrink-0">
                        <ClipboardCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-[#003300] mb-2 group-hover:text-primary transition-colors">
                          {session.session?.title || "N/A"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#003300]/60 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(session.session?.date).toLocaleDateString()}</span>
                          </div>
                          {session.session?.startTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {session.session.startTime}
                                {session.session.endTime && ` - ${session.session.endTime}`}
                              </span>
                            </div>
                          )}
                          <Badge variant="secondary" size="sm" className="capitalize">
                            {session.session?.type || "N/A"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                {session.stats?.attendanceRate || 0}% attendance
                              </span>
                            </div>
                            <span className="text-sm text-[#003300]/60">
                              {session.stats?.totalStudents || 0} students
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-12 border border-[#003300]/10 text-center">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-[#003300]/20" />
                <h3 className="text-lg font-semibold text-[#003300] mb-2">
                  No sessions found
                </h3>
                <p className="text-[#003300]/60">
                  No attendance has been recorded for this course yet
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Attendance Details */}
        {step === 'details' && selectedSession && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Session Info Card */}
            <div className="bg-white rounded-xl p-6 border border-[#003300]/10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white flex-shrink-0">
                  <ClipboardCheck className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#003300] mb-2">
                    {selectedSession.session?.title || "N/A"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[#003300]/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedSession.session?.date).toLocaleDateString()}</span>
                    </div>
                    {selectedSession.session?.startTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {selectedSession.session.startTime}
                          {selectedSession.session.endTime && ` - ${selectedSession.session.endTime}`}
                        </span>
                      </div>
                    )}
                    <Badge variant="secondary" size="sm" className="capitalize">
                      {selectedSession.session?.type || "N/A"}
                    </Badge>
                  </div>
                  {selectedSession.session?.location && (
                    <p className="text-sm text-[#003300]/60 mt-2">
                      Location: {selectedSession.session.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            {selectedSession.stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 border border-[#003300]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-[#003300]/60">Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedSession.stats.attendanceRate}%
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#003300]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-[#003300]/60">Present</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedSession.stats.present}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#003300]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <UserX className="w-4 h-4 text-red-600" />
                    <p className="text-xs text-[#003300]/60">Absent</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {selectedSession.stats.absent}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#003300]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <p className="text-xs text-[#003300]/60">Late</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {selectedSession.stats.late}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#003300]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-[#003300]/60">Excused</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedSession.stats.excused}
                  </p>
                </div>
              </div>
            )}

            {/* Student Attendance Records */}
            <div className="bg-white rounded-xl p-6 border border-[#003300]/10">
              <h3 className="text-lg font-semibold text-[#003300] mb-4">
                Student Attendance ({selectedSession.records?.length || 0} students)
              </h3>

              {selectedSession.records && selectedSession.records.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedSession.records.map((record: any, index: number) => (
                    <motion.div
                      key={record.student._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-[#003300]/5 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-semibold">
                          {record.student.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div>
                          <p className="font-medium text-[#003300]">
                            {record.student.name}
                          </p>
                          <p className="text-xs text-[#003300]/60">
                            {record.student.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {record.checkInTime && (
                          <div className="text-right">
                            <p className="text-xs text-[#003300]/60">Check-in</p>
                            <p className="text-sm font-medium text-[#003300]">
                              {new Date(record.checkInTime).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                        <Badge
                          variant={getStatusBadgeVariant(record.status)}
                          size="sm"
                          className="capitalize min-w-[80px] justify-center"
                        >
                          {getStatusIcon(record.status)}
                          <span className="ml-1">{record.status}</span>
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserMinus className="w-12 h-12 mx-auto mb-3 text-[#003300]/20" />
                  <p className="text-sm text-[#003300]/60">
                    No attendance records found
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
