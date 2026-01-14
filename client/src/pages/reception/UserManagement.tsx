/**
 * UserManagement Page
 *
 * Complete user management interface for reception staff:
 * - View all users in a table
 * - Search and filter by role, name, email
 * - Create new users (students/trainers)
 * - Edit existing users
 * - Delete (deactivate) users
 * - Pagination
 *
 * REDESIGNED: Matching Teacher/Student dashboard UI/UX style
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, RefreshCw, AlertCircle, Trash2, Users, GraduationCap, Briefcase } from 'lucide-react';
import { useReceptionUsers } from '../../hooks';
import type { User } from '../../hooks/useReceptionUsers';
import { UserTable } from '../../components/reception/UserTable';
import { UserForm } from '../../components/reception/UserForm';
import { LoadingState, Alert, Button, Input, Modal, CardComponent, CardBody, StatsCard } from '../../components/ui';

const UserManagement: React.FC = () => {
  // Get users data and CRUD functions from hook
  const {
    users,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    reactivateUser,
  } = useReceptionUsers();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Local filter states
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Calculate stats
  const studentCount = users.filter(u => u.role === 'student').length;
  const trainerCount = users.filter(u => u.role === 'trainer' || u.role === 'teacher').length;
  const otherCount = users.filter(u => !['student', 'trainer', 'teacher'].includes(u.role)).length;

  /**
   * Handle search input change with debouncing
   */
  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput, page: 1 });
  };

  /**
   * Handle role filter change
   */
  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setFilters({ ...filters, role: role || undefined, page: 1 });
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setFilters({ ...filters, status: status || undefined, page: 1 });
  };

  /**
   * Handle create user
   */
  const handleCreate = async (userData: any) => {
    await createUser(userData);
    setIsCreateModalOpen(false);
  };

  /**
   * Handle edit user button click
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  /**
   * Handle edit user submission
   */
  const handleEdit = async (userData: any) => {
    if (selectedUser) {
      await updateUser(selectedUser._id || selectedUser.id!, userData);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  /**
   * Handle delete user button click
   */
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  /**
   * Handle delete user confirmation
   */
  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser._id || selectedUser.id!);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  /**
   * Handle reactivate user
   */
  const handleReactivate = async (userId: string) => {
    try {
      await reactivateUser(userId);
    } catch (error) {
      console.error('Failed to reactivate user:', error);
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="mt-2 text-white/60">
            Manage student, trainer, and staff accounts
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          Create User
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatsCard
          label="Total Students"
          value={studentCount}
          icon={<GraduationCap className="w-6 h-6" />}
        />
        <StatsCard
          label="Total Trainers"
          value={trainerCount}
          icon={<Users className="w-6 h-6" />}
        />
        <StatsCard
          label="Staff & Others"
          value={otherCount}
          icon={<Briefcase className="w-6 h-6" />}
        />
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-primary focus:bg-white/15 transition-all duration-300 hover:border-white/30"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/60 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-secondary focus:bg-white/15 transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer"
              >
                <option value="active" className="bg-zinc-900">Active Users</option>
                <option value="inactive" className="bg-zinc-900">Inactive Users</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-56">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/60 pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent focus:bg-white/15 transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900">All Roles</option>
                <option value="student" className="bg-zinc-900">Students</option>
                <option value="trainer" className="bg-zinc-900">Trainers</option>
                <option value="teacher" className="bg-zinc-900">Teachers</option>
                <option value="reception" className="bg-zinc-900">Reception</option>
                <option value="admin" className="bg-zinc-900">Admins</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <Button
            variant="primary"
            leftIcon={<Search className="w-4 h-4" />}
            onClick={handleSearch}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-6"
          >
            Search
          </Button>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchUsers}
            className="text-white/70 hover:text-white hover:bg-white/10 px-4"
          >
            <span className="hidden lg:inline">Refresh</span>
          </Button>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div variants={itemVariants}>
          <Alert variant="error">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Error Loading Users</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={fetchUsers}
              >
                Retry
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <CardComponent variant="glass" hover>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="p-8">
                <LoadingState type="skeleton" text="Loading users..." />
              </div>
            ) : (
              <>
                <UserTable
                  users={users}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onReactivate={handleReactivate}
                  isLoading={isLoading}
                />

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                    <p className="text-sm text-white/60">
                      Showing {users.length} of {pagination.total} users
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="border-white/10 hover:border-primary/50 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </Button>

                      <span className="text-sm text-white/60 px-4">
                        Page {pagination.page} of {pagination.pages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="border-white/10 hover:border-primary/50 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </CardComponent>
      </motion.div>

      {/* Create User Modal */}
      <UserForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Edit User Modal */}
      <UserForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEdit}
        user={selectedUser}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Are you sure?</p>
              <p className="text-sm text-white/60">
                This will deactivate the user account for <strong>{selectedUser?.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
              }}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default UserManagement;
