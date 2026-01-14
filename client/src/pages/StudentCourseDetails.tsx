import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Lock,
  CheckCircle,
  PlayCircle,
  FileText,
  ClipboardList,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useCourseDetails } from "../hooks";
import {
  CardComponent,
  CardBody,
  Button,
  Badge,
  LoadingState,
  Alert,
} from "../components/ui";

export default function StudentCourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, sessions, progress, isLoading, error, refetch } = useCourseDetails(courseId!);

  // Get session icon based on type
  const getSessionIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-5 h-5" />;
      case "pdf":
        return <FileText className="w-5 h-5" />;
      case "text":
        return <BookOpen className="w-5 h-5" />;
      case "quiz":
        return <ClipboardList className="w-5 h-5" />;
      case "assignment":
        return <FileText className="w-5 h-5" />;
      case "live_session":
        return <Users className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  // Check if session is completed
  const isSessionCompleted = (sessionId: string) => {
    return progress?.completedModules.includes(sessionId) || false;
  };

  // Get session time status (for live sessions)
  const getSessionTimeStatus = (session: any) => {
    if (session.type !== 'live_session' || !session.scheduledDate) {
      return null;
    }

    const now = new Date();
    const sessionDate = new Date(session.scheduledDate);

    // If completed, show completed status
    if (isSessionCompleted(session._id)) {
      return { label: "Completed", variant: "success" as const };
    }

    // If session date has passed, mark as missed (if not completed)
    if (sessionDate < now) {
      return { label: "Missed", variant: "error" as const };
    }

    // Check if session is today
    const isToday = sessionDate.toDateString() === now.toDateString();
    if (isToday) {
      return { label: "Today", variant: "warning" as const };
    }

    // Calculate days until session
    const daysUntil = Math.ceil((sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 3) {
      return { label: `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`, variant: "warning" as const };
    }

    return { label: "Upcoming", variant: "info" as const };
  };

  // Get session status
  const getSessionStatus = (session: any, index: number) => {
    if (isSessionCompleted(session._id)) {
      return { label: "Completed", variant: "success", icon: <CheckCircle className="w-4 h-4" /> };
    }
    if (session.isLocked) {
      return { label: "Locked", variant: "secondary", icon: <Lock className="w-4 h-4" /> };
    }
    if (progress?.currentModule === session._id) {
      return { label: "In Progress", variant: "primary", icon: <PlayCircle className="w-4 h-4" /> };
    }
    return { label: "Available", variant: "outline", icon: <PlayCircle className="w-4 h-4" /> };
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading course details..." />;
  }

  // Show error state
  if (error || !course) {
    return (
      <div className="space-y-8">
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load course</p>
              <p className="text-sm opacity-90">{error || "Course not found"}</p>
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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Link to="/student/courses">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Courses
          </Button>
        </Link>
      </motion.div>

      {/* Course Header */}
      <motion.div variants={itemVariants}>
        <CardComponent variant="glass">
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start gap-4 mb-4">
                  <Badge variant="primary" size="md">
                    {course.category}
                  </Badge>
                  <Badge variant="secondary" size="md">
                    {course.level}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
                <p className="text-white/70 mb-4">{course.description}</p>

                {/* Course Meta */}
                <div className="grid grid-cols-2 gap-4">
                  {course.instructor && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Instructor</p>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{course.instructor.name}</span>
                      </div>
                    </div>
                  )}
                  {course.duration && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Duration</p>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{course.duration}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-white/40 mb-1">Total Sessions</p>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-medium">{sessions.length} sessions</span>
                    </div>
                  </div>
                  {course.startDate && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Start Date</p>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {new Date(course.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Card */}
              <div className="lg:col-span-1">
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 mb-3">
                      <span className="text-3xl font-bold text-primary">
                        {Math.round(progress?.percentageComplete || 0)}%
                      </span>
                    </div>
                    <p className="text-sm text-white/60">Course Progress</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Completed Sessions</span>
                      <span className="font-semibold">
                        {progress?.completedModules?.length || 0} / {sessions.length}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress?.percentageComplete || 0}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </CardComponent>
      </motion.div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <CardComponent variant="glass">
            <CardBody>
              <h2 className="text-2xl font-semibold mb-6">Course Sessions</h2>

              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session, index) => {
                    const status = getSessionStatus(session, index);
                    const isCompleted = isSessionCompleted(session._id);
                    const isLocked = session.isLocked;

                    return (
                      <div
                        key={session._id}
                        className="block"
                      >
                        <motion.div
                          whileHover={!isLocked ? { scale: 1.01 } : {}}
                          className={`p-4 rounded-lg border transition-all duration-300 ${
                            isCompleted
                              ? "bg-success/5 border-success/30"
                              : isLocked
                              ? "bg-white/5 border-white/10 opacity-60"
                              : "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Session Number */}
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                isCompleted
                                  ? "bg-success/20 text-success"
                                  : isLocked
                                  ? "bg-white/5 text-white/40"
                                  : "bg-primary/20 text-primary"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <span>{session.sessionNumber || index + 1}</span>
                              )}
                            </div>

                            {/* Session Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="font-semibold text-sm sm:text-base">
                                  {session.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {/* Session time status badge */}
                                  {(() => {
                                    const sessionTimeStatus = getSessionTimeStatus(session);
                                    if (sessionTimeStatus) {
                                      return (
                                        <Badge variant={sessionTimeStatus.variant} size="sm">
                                          {sessionTimeStatus.label}
                                        </Badge>
                                      );
                                    }
                                    return null;
                                  })()}
                                  {/* Regular session status */}
                                  <Badge variant={status.variant as any} size="sm">
                                    {status.label}
                                  </Badge>
                                </div>
                              </div>
                              {session.description && (
                                <p className="text-sm text-white/60 mb-2 line-clamp-2">
                                  {session.description}
                                </p>
                              )}

                              {/* Session Date/Time - Prominent display for training sessions */}
                              {session.scheduledDate && (
                                <div className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                  <div className="space-y-2 text-sm">
                                    {/* Date and Time */}
                                    <div className="flex items-center gap-2 text-primary font-semibold">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {new Date(session.scheduledDate).toLocaleDateString('en-US', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/80">
                                      <Clock className="w-4 h-4" />
                                      <span>{session.startTime} - {session.endTime}</span>
                                      <span className="text-white/50">
                                        ({session.duration} min)
                                      </span>
                                    </div>
                                    {session.trainerId && (
                                      <div className="flex items-center gap-2 text-white/80">
                                        <Users className="w-4 h-4" />
                                        <span>Trainer: {session.trainerId.name}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                {session.quiz && !isLocked && (
                                  <div className="flex items-center gap-2">
                                    <Link to={`/student/quizzes/${typeof session.quiz === 'object' ? session.quiz._id : session.quiz}`}>
                                      <Button
                                        variant={session.quizAttempt ? "outline" : "primary"}
                                        size="sm"
                                        leftIcon={<ClipboardList className="w-3 h-3" />}
                                        className="cursor-pointer"
                                      >
                                        {session.quizAttempt ? "View Grade" : "Take Quiz"}
                                      </Button>
                                    </Link>
                                    {session.quizAttempt && (
                                      <Badge
                                        variant={session.quizAttempt.passed ? "success" : "error"}
                                        size="sm"
                                      >
                                        Score: {session.quizAttempt.score}%
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions available yet</p>
                </div>
              )}
            </CardBody>
          </CardComponent>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Instructor */}
          {course.instructor && (
            <CardComponent variant="glass">
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{course.instructor.name || "Instructor"}</p>
                    <p className="text-sm text-white/60">{course.instructor.email || ""}</p>
                  </div>
                </div>
              </CardBody>
            </CardComponent>
          )}

          {/* Course Info */}
          <CardComponent variant="glass">
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Course Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Course Name</span>
                  <span className="font-semibold">{course.title}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Duration</span>
                  <span className="font-semibold">{course.duration || "N/A"}</span>
                </div>
                {course.instructor && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Trainer</span>
                    <span className="font-semibold">{course.instructor.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Price</span>
                  <span className="font-semibold">${course.price}</span>
                </div>
              </div>
            </CardBody>
          </CardComponent>

          {/* Quick Actions */}
          <CardComponent variant="glass">
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to={`/student/attendance/${courseId}`} className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full cursor-pointer"
                    leftIcon={<Calendar className="w-4 h-4" />}
                  >
                    View Attendance
                  </Button>
                </Link>
                <Link to={`/student/payments/${courseId}`} className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full cursor-pointer"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  >
                    Payment History
                  </Button>
                </Link>
              </div>
            </CardBody>
          </CardComponent>
        </motion.div>
      </div>
    </motion.div>
  );
}
