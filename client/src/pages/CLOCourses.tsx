import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Archive,
  RefreshCw,
  AlertCircle,
  Users,
  TrendingUp,
  CheckCircle,
  Trash2,
  ArchiveRestore,
} from "lucide-react";
import { useCLOCourses } from "../hooks";
import {
  Button,
  Badge,
  LoadingState,
  Alert,
  Input,
} from "../components/ui";
import CourseModal, { type CourseFormData } from "../components/clo/CourseModal";
import CourseDetailsModal from "../components/clo/CourseDetailsModal";
import type { Course } from "../hooks/useCLOCourses";

export default function CLOCourses() {
  const { courses, isLoading, error, fetchCourses, createCourse, updateCourse, deleteCourse, archiveCourse } =
    useCLOCourses();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

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

  useEffect(() => {
    const params: any = {};

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    if (categoryFilter !== "all") {
      params.category = categoryFilter;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery;
    }

    fetchCourses(params);
  }, [searchQuery, statusFilter, categoryFilter, fetchCourses]);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleSubmit = async (data: CourseFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedCourse) {
        // Update existing course
        await updateCourse(selectedCourse._id, data);
        alert("Course updated successfully!");
      } else {
        // Create new course
        await createCourse(data);
        alert("Course created successfully!");
      }
      handleCloseModal();
      fetchCourses(); // Refresh list
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (courseId: string) => {
    try {
      await updateCourse(courseId, { status: "published" } as any);
      alert("Course published successfully!");
      fetchCourses();
    } catch (err: any) {
      alert(err.message || "Failed to publish course");
    }
  };

  const handleArchive = async (courseId: string, status: string) => {
    try {
      await updateCourse(courseId, { status: "archived" } as any);
      alert("Course archived successfully!");
      fetchCourses();
    } catch (err: any) {
      alert(err.message || "Failed to archive course");
    }
  };

  const handleUnarchive = async (courseId: string) => {
    try {
      await updateCourse(courseId, { status: "draft" } as any);
      alert("Course restored to draft!");
      fetchCourses();
    } catch (err: any) {
      alert(err.message || "Failed to restore course");
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteCourse(courseId);
      alert("Course deleted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to delete course");
    }
  };

  // Details modal handlers
  const handleOpenDetails = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedCourseId(null);
  };

  if (isLoading && courses.length === 0) {
    return <LoadingState type="skeleton" text="Loading courses..." />;
  }

  const categories = Array.from(
    new Set(courses.map((c) => c.category))
  ).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003300]">Courses</h1>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
        >
          Add Course
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-[#003300]/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#003300]/40" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div variants={itemVariants}>
          <Alert variant="error">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={() => fetchCourses()}
              >
                Retry
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="bg-white rounded-xl p-6 border border-[#003300]/10 hover:border-primary/30 hover:shadow-md transition-all h-full flex flex-col">
                {/* Header with status and actions */}
                <div className="flex items-start justify-between mb-4">
                  <Badge
                    variant={
                      course.status === "published"
                        ? "success"
                        : course.status === "draft"
                        ? "warning"
                        : "secondary"
                    }
                    size="sm"
                  >
                    {course.status}
                  </Badge>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                      onClick={() => handleOpenDetails(course._id)}
                      title="View Details"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Edit className="w-4 h-4" />}
                      onClick={() => handleOpenEditModal(course)}
                      title="Edit Course"
                    />

                    {/* Show Publish button only for draft courses */}
                    {course.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                        onClick={() => handlePublish(course._id)}
                        title="Publish Course"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      />
                    )}

                    {/* Show Archive button only for published courses */}
                    {course.status === "published" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Archive className="w-4 h-4" />}
                        onClick={() => handleArchive(course._id, course.status)}
                        title="Archive Course"
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      />
                    )}

                    {/* Show Restore button only for archived courses */}
                    {course.status === "archived" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<ArchiveRestore className="w-4 h-4" />}
                        onClick={() => handleUnarchive(course._id)}
                        title="Restore to Draft"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      />
                    )}

                    {/* Show Delete button only for draft courses */}
                    {course.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDelete(course._id)}
                        title="Delete Course"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      />
                    )}
                  </div>
                </div>

                {/* Course icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-4">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[#003300] mb-2 line-clamp-2">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#003300]/60 mb-4 line-clamp-2 flex-grow">
                  {course.description || "No description"}
                </p>

                {/* Category and Level */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-medium">
                    {course.category}
                  </span>
                  {course.level && (
                    <span className="text-xs text-[#003300]/60 capitalize">
                      {course.level}
                    </span>
                  )}
                </div>

                {/* Stats */}
                {course.stats && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#003300]/10">
                    <div>
                      <p className="text-xs text-[#003300]/60 mb-1">Groups</p>
                      <div className="flex items-baseline gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <p className="text-lg font-semibold text-[#003300]">
                          {course.stats.totalGroups || 0}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#003300]/60 mb-1">Students</p>
                      <div className="flex items-baseline gap-1">
                        <Users className="w-4 h-4 text-secondary" />
                        <p className="text-lg font-semibold text-[#003300]">
                          {course.stats.totalEnrollments || 0}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#003300]/60 mb-1">Complete</p>
                      <div className="flex items-baseline gap-1">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <p className="text-lg font-semibold text-green-600">
                          {course.stats.completionRate?.toFixed(0) || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl p-6 border border-[#003300]/10">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#003300]/20" />
              <h3 className="text-lg font-semibold text-[#003300] mb-2">
                No courses found
              </h3>
              <p className="text-[#003300]/60 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding your first course"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenCreateModal}
                >
                  Add Course
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        course={selectedCourse}
        isLoading={isSubmitting}
      />

      {/* Course Details Modal */}
      <CourseDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        courseId={selectedCourseId}
      />
    </motion.div>
  );
}
