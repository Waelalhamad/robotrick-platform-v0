import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle,
  Lock,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useStudentCourses } from "../hooks";
import {
  CardComponent,
  CardBody,
  Button,
  Input,
  Badge,
  LoadingState,
  Alert,
} from "../components/ui";

export default function StudentCourses() {
  const { courses, isLoading, error, refetch } = useStudentCourses();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter courses
  const filteredCourses = courses.filter((enrollment) => {
    const matchesSearch = enrollment.course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    return <LoadingState type="skeleton" text="Loading your courses..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load courses</p>
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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          My Courses
        </h1>
        <p className="mt-2 text-white/60">
          View and manage your enrolled courses
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search courses..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "primary" : "outline"}
            size="md"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "primary" : "outline"}
            size="md"
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "completed" ? "primary" : "outline"}
            size="md"
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </motion.div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.map((enrollment) => (
            <motion.div key={enrollment._id} variants={itemVariants}>
              <Link to={`/student/courses/${enrollment.course._id}`}>
                <CardComponent variant="glass" hover className="h-full">
                  <CardBody className="flex flex-col h-full">
                    {/* Course Thumbnail */}
                    <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl">
                      {enrollment.course.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white/40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge
                          variant={
                            enrollment.status === "completed"
                              ? "success"
                              : "primary"
                          }
                          size="sm"
                        >
                          {enrollment.status}
                        </Badge>
                        <Badge variant="secondary" size="sm">
                          {enrollment.course.level}
                        </Badge>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-white/60 mb-4 line-clamp-2">
                        {enrollment.course.description}
                      </p>

                      {/* Course Meta */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <BookOpen className="w-4 h-4" />
                          <span>
                            {enrollment.course.instructor?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Clock className="w-4 h-4" />
                          <span>{enrollment.course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <TrendingUp className="w-4 h-4" />
                          <span>
                            {enrollment.progress.completedModules.length}{" "}
                            modules completed
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Progress</span>
                          <span className="font-semibold text-primary">
                            {Math.round(enrollment.progress.percentageComplete)}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${enrollment.progress.percentageComplete}%`,
                            }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          />
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
                        <div>
                          <p className="text-xs text-white/40">Attendance</p>
                          <p className="text-sm font-semibold text-accent">
                            {Math.round(enrollment.attendance.percentage)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Remaining</p>
                          <p className="text-sm font-semibold text-secondary">
                            ${enrollment.payment.remainingAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant={
                        enrollment.status === "completed"
                          ? "outline"
                          : "primary"
                      }
                      size="md"
                      className="w-full mt-4"
                      rightIcon={
                        enrollment.status === "completed" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )
                      }
                    >
                      {enrollment.status === "completed"
                        ? "View Certificate"
                        : "Continue Learning"}
                    </Button>
                  </CardBody>
                </CardComponent>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <CardComponent variant="glass">
            <CardBody className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-white/60 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't enrolled in any courses yet"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link to="/courses">
                  <Button variant="primary" size="md">
                    Browse Available Courses
                  </Button>
                </Link>
              )}
            </CardBody>
          </CardComponent>
        </motion.div>
      )}
    </motion.div>
  );
}
