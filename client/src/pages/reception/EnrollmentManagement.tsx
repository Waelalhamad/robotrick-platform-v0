/**
 * EnrollmentManagement Page
 *
 * Complete enrollment management interface for reception staff:
 * - View all enrollments in a table
 * - Filter by course, student, status
 * - Create new enrollments
 * - Edit enrollment status
 * - Pagination
 *
 * REDESIGNED: Matching Teacher/Student dashboard UI/UX style
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, RefreshCw, AlertCircle, CheckCircle, XCircle, DollarSign, BookOpen, Filter } from 'lucide-react';
import { useReceptionEnrollments } from '../../hooks';
import type { Enrollment } from '../../hooks/useReceptionEnrollments';
import { EnrollmentList } from '../../components/reception/EnrollmentList';
import { EnrollmentForm } from '../../components/reception/EnrollmentForm';
import { LoadingState, Alert, Button, Input, Modal, CardComponent, CardBody, StatsCard } from '../../components/ui';

const EnrollmentManagement: React.FC = () => {
  // Get enrollments data and functions from hook
  const {
    enrollments,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    fetchEnrollments,
    createEnrollment,
    updateEnrollment,
    recordPayment,
    downloadReceipt,
    availableCourses,
    availableGroups,
    availableStudents,
    fetchAvailableCourses,
    fetchAvailableGroups,
    fetchAvailableStudents,
  } = useReceptionEnrollments();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [receiptData, setReceiptData] = useState<{ receiptId: string; receiptNumber: string; downloadUrl: string } | null>(null);

  // Local filter states
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
  const activeCount = enrollments.filter(e => e.status === 'active').length;
  const inactiveCount = enrollments.filter(e => e.status === 'inactive').length;
  const totalEnrollments = enrollments.length;

  /**
   * Load courses when create modal opens
   */
  useEffect(() => {
    if (isCreateModalOpen) {
      fetchAvailableCourses();
      fetchAvailableStudents();
    }
  }, [isCreateModalOpen, fetchAvailableCourses, fetchAvailableStudents]);

  /**
   * Handle search
   */
  const handleSearch = () => {
    setFilters({ ...filters, student: searchInput, page: 1 });
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setFilters({ ...filters, status: status || undefined, page: 1 });
  };

  /**
   * Handle create enrollment
   */
  const handleCreate = async (data: any) => {
    await createEnrollment(data);
    setIsCreateModalOpen(false);
  };

  /**
   * Handle edit enrollment button click
   */
  const handleEditClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsEditModalOpen(true);
  };

  /**
   * Handle edit enrollment status
   */
  const handleEdit = async (newStatus: string) => {
    if (selectedEnrollment) {
      await updateEnrollment(selectedEnrollment._id, { status: newStatus as any });
      setIsEditModalOpen(false);
      setSelectedEnrollment(null);
    }
  };

  /**
   * Handle record payment button click
   */
  const handleRecordPaymentClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setPaymentNotes('');
    setReceiptData(null);
    setIsPaymentModalOpen(true);
  };

  /**
   * Handle record payment
   */
  const handleRecordPayment = async () => {
    if (!selectedEnrollment || !paymentAmount) {
      alert('Please enter a payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (amount > selectedEnrollment.payment.remainingAmount) {
      alert(`Payment amount cannot exceed remaining balance: $${selectedEnrollment.payment.remainingAmount}`);
      return;
    }

    try {
      setIsRecordingPayment(true);
      const receipt = await recordPayment(selectedEnrollment._id, amount, paymentMethod, paymentNotes);

      if (receipt) {
        // Payment successful with receipt
        setReceiptData(receipt);
        // Auto-download receipt
        await downloadReceipt(receipt.receiptId, receipt.receiptNumber);
      } else {
        // Payment recorded but no receipt (shouldn't happen)
        setIsPaymentModalOpen(false);
        setSelectedEnrollment(null);
        alert('Payment recorded successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  /**
   * Handle download receipt again
   */
  const handleDownloadReceipt = async () => {
    if (!receiptData) return;

    try {
      await downloadReceipt(receiptData.receiptId, receiptData.receiptNumber);
    } catch (err: any) {
      alert(err.message || 'Failed to download receipt');
    }
  };

  /**
   * Handle download full receipt for completed enrollment
   */
  const handleDownloadFullReceipt = async (enrollmentId: string) => {
    try {
      // Fetch all receipts for this enrollment
      const response = await fetch(`/api/reception/receipts/enrollment/${enrollmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch receipts');
      }

      const data = await response.json();
      const receipts = data.data;

      if (!receipts || receipts.length === 0) {
        alert('No receipt found for this enrollment');
        return;
      }

      // Download the latest receipt
      const latestReceipt = receipts[0]; // Receipts are sorted by createdAt desc
      await downloadReceipt(latestReceipt._id, latestReceipt.receiptNumber);
    } catch (err: any) {
      alert(err.message || 'Failed to download receipt');
      console.error('Error downloading receipt:', err);
    }
  };

  /**
   * Close payment modal after receipt downloaded
   */
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedEnrollment(null);
    setReceiptData(null);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  /**
   * Handle course select in form
   */
  const handleCourseSelect = (courseId: string) => {
    fetchAvailableGroups(courseId);
  };

  /**
   * Handle student search in form
   */
  const handleStudentSearch = (courseId?: string) => {
    fetchAvailableStudents(courseId);
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
            Enrollment Management
          </h1>
          <p className="mt-2 text-white/60">
            Register students in courses and manage enrollments
          </p>
        </div>

        {/* Create Enrollment Button */}
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          New Enrollment
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatsCard
          label="Total Enrollments"
          value={totalEnrollments}
          icon={<BookOpen className="w-6 h-6" />}
        />
        <StatsCard
          label="Active"
          value={activeCount}
          icon={<CheckCircle className="w-6 h-6" />}
        />
        <StatsCard
          label="Inactive"
          value={inactiveCount}
          icon={<XCircle className="w-6 h-6" />}
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
                placeholder="Search by student name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-primary focus:bg-white/15 transition-all duration-300 hover:border-white/30"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-56">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/60 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent focus:bg-white/15 transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900">All Status</option>
                <option value="active" className="bg-zinc-900">Active</option>
                <option value="inactive" className="bg-zinc-900">Inactive</option>
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
            onClick={fetchEnrollments}
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
                <p className="font-semibold mb-1">Error Loading Enrollments</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={fetchEnrollments}
              >
                Retry
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}

      {/* Enrollments Table */}
      <motion.div variants={itemVariants}>
        <CardComponent variant="glass" hover>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="p-8">
                <LoadingState type="skeleton" text="Loading enrollments..." />
              </div>
            ) : (
              <>
                <EnrollmentList
                  enrollments={enrollments}
                  onEdit={handleEditClick}
                  onRecordPayment={handleRecordPaymentClick}
                  onDownloadReceipt={handleDownloadFullReceipt}
                  isLoading={isLoading}
                />

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                    <p className="text-sm text-white/60">
                      Showing {enrollments.length} of {pagination.total} enrollments
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

      {/* Create Enrollment Modal */}
      <EnrollmentForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        availableCourses={availableCourses}
        availableGroups={availableGroups}
        availableStudents={availableStudents}
        onCourseSelect={handleCourseSelect}
        onStudentSearch={handleStudentSearch}
      />

      {/* Edit Enrollment Status Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEnrollment(null);
        }}
        title="Update Enrollment Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-white/60">
            Change enrollment status for <strong className="text-white">{selectedEnrollment?.student.name}</strong>
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleEdit('active')}
              className="w-full p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 rounded-lg text-green-400 font-medium transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Active
            </button>
            <button
              onClick={() => handleEdit('inactive')}
              className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg text-red-400 font-medium transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Mark as Inactive
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedEnrollment(null);
              }}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        title={receiptData ? "Payment Successful!" : "Record Payment"}
        size="md"
      >
        <div className="space-y-6">
          {/* Student and Balance Info */}
          <div className="bg-white p-6 rounded-xl border-2 border-zinc-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-zinc-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-md">
                {selectedEnrollment?.student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-zinc-900 text-lg">{selectedEnrollment?.student?.name}</p>
                <p className="text-sm text-zinc-600 font-medium">{selectedEnrollment?.course?.title || 'Course'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-semibold text-zinc-700">Total Course Fee</p>
                <p className="font-bold text-zinc-900 text-lg">${selectedEnrollment?.payment.totalAmount}</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-semibold text-zinc-700">Amount Paid</p>
                <p className="font-bold text-green-600 text-lg">${selectedEnrollment?.payment.paidAmount}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-zinc-200">
                <p className="text-base font-bold text-zinc-900">Balance Due</p>
                <p className="text-3xl font-bold text-red-600">
                  ${selectedEnrollment?.payment.remainingAmount}
                </p>
              </div>
            </div>
          </div>

          {/* Show either form or success message */}
          {!receiptData ? (
            <>
              {/* Payment Form */}
              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Payment Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xl font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedEnrollment?.payment.remainingAmount}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-300 rounded-xl text-zinc-900 text-xl font-bold placeholder-zinc-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all shadow-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-zinc-600 font-medium">
                      Maximum: ${selectedEnrollment?.payment.remainingAmount}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(selectedEnrollment?.payment.remainingAmount.toString() || '')}
                      className="text-xs text-primary hover:text-primary/80 font-bold transition-colors px-3 py-1 bg-primary/10 rounded-lg hover:bg-primary/20"
                    >
                      Pay Full Amount
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-3">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Add transaction reference, receipt number, or any additional notes..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all resize-none shadow-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-6 border-t-2 border-zinc-200">
                <Button
                  variant="ghost"
                  onClick={handleClosePaymentModal}
                  disabled={isRecordingPayment}
                  className="flex-1 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border-2 border-zinc-300 py-3 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRecordPayment}
                  disabled={isRecordingPayment || !paymentAmount}
                  leftIcon={<CheckCircle className="w-5 h-5" />}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 shadow-xl"
                >
                  {isRecordingPayment ? 'Processing...' : 'Record Payment'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Success Message with Receipt Info */}
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Payment Recorded Successfully!
                </h3>

                <p className="text-white/60 mb-4">
                  Receipt #{receiptData.receiptNumber} has been generated
                </p>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Amount Paid</span>
                    <span className="font-bold text-green-400">${paymentAmount}</span>
                  </div>
                </div>

                <p className="text-sm text-white/50 mb-4">
                  The receipt has been downloaded automatically. You can download it again if needed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={handleDownloadReceipt}
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  className="border-white/10 hover:border-primary/50 text-white"
                >
                  Download Receipt Again
                </Button>
                <Button
                  variant="primary"
                  onClick={handleClosePaymentModal}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </motion.div>
  );
};

export default EnrollmentManagement;
