import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  UsersRound,
  GraduationCap,
  TrendingUp,
  Activity,
  Award,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { useCLODashboard } from "../hooks";
import {
  Button,
  LoadingState,
  Alert,
  Badge,
} from "../components/ui";
import { Link, useNavigate } from "react-router-dom";

export default function CLODashboard() {
  const { stats, topTrainers, recentActivity, isLoading, error, refetch } =
    useCLODashboard();
  const navigate = useNavigate();

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

  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load dashboard</p>
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

  // Stat cards configuration - Simplified color scheme
  const statCards = [
    {
      title: "Total Trainers",
      value: stats?.trainers.total || 0,
      subtitle: `${stats?.trainers.active || 0} active`,
      icon: <Users className="w-8 h-8" />,
      color: "from-emerald-500 to-green-500",
      lightColor: "from-emerald-50 to-green-50",
      link: "/clo/trainers",
    },
    {
      title: "Total Courses",
      value: stats?.courses.total || 0,
      subtitle: `${stats?.courses.published || 0} published`,
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-emerald-500 to-teal-500",
      lightColor: "from-emerald-50 to-teal-50",
      link: "/clo/courses",
    },
    {
      title: "Active Groups",
      value: stats?.groups.active || 0,
      subtitle: `${stats?.groups.total || 0} total groups`,
      icon: <UsersRound className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      lightColor: "from-green-50 to-emerald-50",
      link: "/clo/groups",
    },
    {
      title: "Total Students",
      value: stats?.students.total || 0,
      subtitle: `${stats?.enrollments.active || 0} active enrollments`,
      icon: <GraduationCap className="w-8 h-8" />,
      color: "from-teal-500 to-cyan-500",
      lightColor: "from-teal-50 to-cyan-50",
      link: "#",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        variants={itemVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#003300] mb-2">
              CLO Dashboard
            </h1>
            <p className="text-[#003300]/70">
              Chief Learning Officer - Oversee trainers, courses, and groups
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={refetch}
            className="text-[#003300]/70 hover:text-primary border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            variants={itemVariants}
            className="relative group cursor-pointer"
            onClick={() => navigate(card.link)}
          >
            {/* Subtle background effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${card.lightColor} rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
            ></div>

            {/* Card content */}
            <div className="relative bg-white rounded-2xl p-6 border border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                {/* Icon with gradient background */}
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${card.lightColor} flex items-center justify-center`}
                >
                  <div className="text-[#003300]">{card.icon}</div>
                </div>

                {/* Value with gradient text */}
                <div
                  className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}
                >
                  {card.value.toLocaleString()}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-[#003300] mb-1">
                {card.title}
              </h3>

              {/* Subtitle */}
              {card.subtitle && (
                <p className="text-sm text-[#003300]/60">{card.subtitle}</p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Attendance Rate */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#003300]">
                  Attendance Rate
                </h3>
                <p className="text-sm text-[#003300]/60">System-wide average</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                {stats?.performance.attendanceRate || 0}%
              </span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            {/* Progress bar for attendance */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${stats?.performance.attendanceRate || 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50">
                <Award className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#003300]">
                  Completion Rate
                </h3>
                <p className="text-sm text-[#003300]/60">Course completion</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                {stats?.performance.completionRate || 0}%
              </span>
              <TrendingUp className="w-5 h-5 text-teal-500" />
            </div>
            {/* Progress bar for completion */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                style={{
                  width: `${stats?.performance.completionRate || 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Trainers & Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Top Performing Trainers */}
        <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#003300]">
              Top Performing Trainers
            </h3>
            <Link to="/clo/trainers">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {topTrainers && topTrainers.length > 0 ? (
              topTrainers.slice(0, 5).map((trainer: any, index: number) => (
                <div
                  key={trainer._id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#003300] truncate">
                        {trainer.trainerName}
                      </p>
                      <p className="text-sm text-[#003300]/60">
                        {trainer.totalGroups} {trainer.totalGroups === 1 ? "group" : "groups"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {trainer.avgAttendance?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-[#003300]/50">attendance</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-[#003300]/20" />
                <p className="text-[#003300]/60">No trainer data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-md">
          <h3 className="text-2xl font-bold text-[#003300] mb-6">
            Recent Activity
          </h3>

          <div className="space-y-4">
            {recentActivity?.groups && recentActivity.groups.length > 0 ? (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-[#003300]/60 mb-3 uppercase tracking-wide">
                    Recent Groups
                  </h4>
                  <div className="space-y-2">
                    {recentActivity.groups.slice(0, 3).map((group: any) => (
                      <div
                        key={group._id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50/50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50">
                          <UsersRound className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#003300] text-sm truncate">
                            {group.name}
                          </p>
                          <p className="text-xs text-[#003300]/60">
                            {group.courseId?.title || "N/A"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            group.status === "active" ? "success" : "secondary"
                          }
                          size="sm"
                        >
                          {group.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {recentActivity.courses && recentActivity.courses.length > 0 && (
                  <div className="pt-4 border-t border-[#003300]/10">
                    <h4 className="text-sm font-semibold text-[#003300]/60 mb-3 uppercase tracking-wide">
                      Recent Courses
                    </h4>
                    <div className="space-y-2">
                      {recentActivity.courses.slice(0, 3).map((course: any) => (
                        <div
                          key={course._id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50">
                            <BookOpen className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#003300] text-sm truncate">
                              {course.title}
                            </p>
                            <p className="text-xs text-[#003300]/60">
                              {course.category}
                            </p>
                          </div>
                          <Badge
                            variant={
                              course.status === "published"
                                ? "success"
                                : "warning"
                            }
                            size="sm"
                          >
                            {course.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto mb-3 text-[#003300]/20" />
                <p className="text-[#003300]/60">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
