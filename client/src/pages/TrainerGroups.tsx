import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Search,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useTrainerGroups } from "../hooks/useTrainerGroups";
import {
  CardComponent,
  CardBody,
  Button,
  Badge,
  LoadingState,
  Alert,
  Input,
} from "../components/ui";

export default function TrainerGroups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const { groups, isLoading, error, refetch } = useTrainerGroups({
    status: statusFilter as any,
    search: searchQuery,
  });

  // Refetch when filters change
  useEffect(() => {
    refetch({
      status: statusFilter as any,
      search: searchQuery,
    });
  }, [statusFilter, searchQuery, refetch]);

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

  // Calculate summary stats
  const totalStudents = groups.reduce((sum, group) => sum + group.students.length, 0);
  const avgAttendance = groups.length > 0
    ? Math.round(groups.reduce((sum, group) => sum + (group.stats?.averageAttendance || 0), 0) / groups.length)
    : 0;

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading groups..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load groups</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => refetch()}
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
          <p className="text-gray-600 mt-1">Manage your training groups and students</p>
        </div>
        {/* Group creation removed - now managed by CLO */}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <CardComponent variant="default">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Groups</p>
                <p className="text-3xl font-bold text-gray-900">{groups.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="default">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="default">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Attendance</p>
                <p className="text-3xl font-bold text-gray-900">{avgAttendance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardBody>
        </CardComponent>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </motion.div>

      {/* Groups Grid */}
      {groups.length > 0 ? (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {groups.map((group, index) => (
            <motion.div key={group._id} variants={itemVariants}>
              <Link to={`/trainer/groups/${group._id}`}>
                <CardComponent variant="glass" hover className="h-full">
                  <CardBody>
                    {/* Group Header */}
                    <div className="flex items-start gap-3 mb-4">
                      {group.thumbnail ? (
                        <img
                          src={group.thumbnail}
                          alt={group.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: group.color + "33" }}
                        >
                          <Users className="w-6 h-6" style={{ color: group.color }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {group.name}
                        </h3>
                        <p className="text-xs text-white/60 truncate">
                          {group.courseId?.title}
                        </p>
                      </div>
                      <Badge
                        variant={
                          group.status === "active"
                            ? "success"
                            : group.status === "completed"
                            ? "primary"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {group.status}
                      </Badge>
                    </div>

                    {/* Description */}
                    {group.description && (
                      <p className="text-sm text-white/60 mb-4 line-clamp-2">
                        {group.description}
                      </p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-white/40">Students</p>
                          <p className="text-sm font-semibold">
                            {group.students.length}/{group.maxStudents}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-xs text-white/40">Attendance</p>
                          <p className="text-sm font-semibold">
                            {Math.round(group.stats?.averageAttendance || 0)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <div>
                          <p className="text-xs text-white/40">Sessions</p>
                          <p className="text-sm font-semibold">
                            {group.progress?.completedSessions || 0}/
                            {group.progress?.totalSessions || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-secondary" />
                        <div>
                          <p className="text-xs text-white/40">Progress</p>
                          <p className="text-sm font-semibold">
                            {Math.round(group.progress?.percentageComplete || 0)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${group.progress?.percentageComplete || 0}%`,
                          }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </div>
                    </div>

                    {/* Schedule Info */}
                    {group.schedule && group.schedule.length > 0 && (
                      <div className="text-xs text-white/40 mb-4">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {group.schedule.slice(0, 2).map((s, i) => (
                          <span key={i}>
                            {s.day} {s.startTime}
                            {i < group.schedule.length - 1 && i < 1 ? ", " : ""}
                          </span>
                        ))}
                        {group.schedule.length > 2 && " ..."}
                      </div>
                    )}

                    {/* View Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      rightIcon={<Eye className="w-4 h-4" />}
                    >
                      View Details
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
              <Users className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-xl font-semibold mb-2">No groups found</h3>
              <p className="text-white/60 mb-6">
                {searchQuery || statusFilter !== "active"
                  ? "Try adjusting your filters"
                  : "No groups have been assigned to you yet. Contact your CLO to get assigned to groups."}
              </p>
            </CardBody>
          </CardComponent>
        </motion.div>
      )}
    </motion.div>
  );
}
