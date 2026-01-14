import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UsersRound,
  Plus,
  Search,
  Eye,
  Edit,
  UserMinus,
  RefreshCw,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  Users,
  Trash2,
} from "lucide-react";
import { useCLOGroups } from "../hooks";
import { useCLOCourses } from "../hooks/useCLOCourses";
import { useCLOTrainers } from "../hooks/useCLOTrainers";
import {
  Button,
  Badge,
  LoadingState,
  Alert,
  Input,
} from "../components/ui";
import GroupModal, { type GroupFormData } from "../components/clo/GroupModal";
import GroupDetailsModal from "../components/clo/GroupDetailsModal";
import type { Group } from "../hooks/useCLOGroups";

export default function CLOGroups() {
  const { groups, isLoading, error, fetchGroups, createGroup, updateGroup, deleteGroup, closeGroup } = useCLOGroups();
  const { courses, fetchCourses } = useCLOCourses();
  const { trainers, fetchTrainers } = useCLOTrainers();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

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

    if (searchQuery.trim()) {
      params.search = searchQuery;
    }

    fetchGroups(params);
  }, [searchQuery, statusFilter, fetchGroups]);

  // Fetch courses and trainers for modal dropdowns
  useEffect(() => {
    fetchCourses({ status: 'published' });
    fetchTrainers(); // Fetch all trainers instead of filtering by status
  }, [fetchCourses, fetchTrainers]);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setSelectedGroup(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (group: Group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  const handleSubmit = async (data: GroupFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedGroup) {
        // Update existing group
        await updateGroup(selectedGroup._id, data);
        alert("Group updated successfully!");
      } else {
        // Create new group
        await createGroup(data);
        alert("Group created successfully!");
      }
      handleCloseModal();
      fetchGroups(); // Refresh list
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async (groupId: string, status: string) => {
    try {
      await closeGroup(groupId, status === "completed" ? "reopen" : "close");
      alert(
        `Group ${status === "completed" ? "reopened" : "closed"} successfully`
      );
      fetchGroups(); // Refresh list
    } catch (err: any) {
      alert(err.message || "Failed to update group status");
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteGroup(groupId);
      alert("Group deleted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to delete group");
    }
  };

  // Details modal handlers
  const handleOpenDetails = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedGroupId(null);
  };

  if (isLoading && groups.length === 0) {
    return <LoadingState type="skeleton" text="Loading groups..." />;
  }

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
          <h1 className="text-3xl font-bold text-[#003300]">Groups</h1>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
        >
          Create Group
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-[#003300]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#003300]/40" />
              <Input
                type="text"
                placeholder="Search groups..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
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
                onClick={() => fetchGroups()}
              >
                Retry
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}

      {/* Groups List */}
      <div className="grid grid-cols-1 gap-4">
        {groups.length > 0 ? (
          groups.map((group, index) => (
            <motion.div
              key={group._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="bg-white rounded-xl p-6 border border-[#003300]/10 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white flex-shrink-0">
                    <UsersRound className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold text-[#003300] truncate">
                            {group.name}
                          </h3>
                          <Badge
                            variant={
                              group.status === "active"
                                ? "success"
                                : "secondary"
                            }
                            size="sm"
                          >
                            {group.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#003300]/60">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span title={JSON.stringify(group.courseId)}>
                              {group.courseId?.title || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span title={JSON.stringify(group.trainerId)}>
                              {group.trainerId?.name || "N/A"}
                            </span>
                          </div>
                          {group.startDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(group.startDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={() => handleOpenDetails(group._id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit className="w-4 h-4" />}
                          onClick={() => handleOpenEditModal(group)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={
                            group.status === "completed" ? "primary" : "ghost"
                          }
                          size="sm"
                          leftIcon={<UserMinus className="w-4 h-4" />}
                          onClick={() => handleClose(group._id, group.status)}
                        >
                          {group.status === "completed" ? "Reopen" : "Close"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDelete(group._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Group"
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    {group.stats && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#003300]/10">
                        <div>
                          <p className="text-xs text-[#003300]/60 mb-1">
                            Students
                          </p>
                          <div className="flex items-baseline gap-1">
                            <Users className="w-4 h-4 text-primary" />
                            <p className="text-lg font-semibold text-[#003300]">
                              {group.stats.studentsCount || 0}
                              {(group.maxStudents || group.maxCapacity) && (
                                <span className="text-sm font-normal text-[#003300]/60">
                                  /{group.maxStudents || group.maxCapacity}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#003300]/60 mb-1">
                            Enrollments
                          </p>
                          <div className="flex items-baseline gap-1">
                            <UsersRound className="w-4 h-4 text-secondary" />
                            <p className="text-lg font-semibold text-[#003300]">
                              {group.stats.enrollments || 0}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#003300]/60 mb-1">
                            Attendance
                          </p>
                          <div className="flex items-baseline gap-1">
                            <Calendar className="w-4 h-4 text-accent" />
                            <p className="text-lg font-semibold text-green-600">
                              {group.stats.avgAttendance?.toFixed(1) || 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-6 border border-[#003300]/10">
            <div className="text-center py-12">
              <UsersRound className="w-16 h-16 mx-auto mb-4 text-[#003300]/20" />
              <h3 className="text-lg font-semibold text-[#003300] mb-2">
                No groups found
              </h3>
              <p className="text-[#003300]/60 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first group"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenCreateModal}
                >
                  Create Group
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Group Modal */}
      <GroupModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        group={selectedGroup}
        courses={courses}
        trainers={trainers}
        isLoading={isSubmitting}
      />

      {/* Group Details Modal */}
      <GroupDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        groupId={selectedGroupId}
      />
    </motion.div>
  );
}
