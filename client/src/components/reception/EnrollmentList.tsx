/**
 * EnrollmentList Component
 *
 * Displays a table of enrollments with:
 * - Student and course information
 * - Payment status and progress
 * - Enrollment status badges
 * - Action buttons
 *
 * UPDATED: Light mode with brand colors (dark green & cream)
 */

import React from 'react';
import { Calendar, DollarSign, Edit2, BookOpen, Download } from 'lucide-react';
import { Badge, Button } from '../ui';
import type { Enrollment } from '../../hooks/useReceptionEnrollments';

/**
 * Props for EnrollmentList component
 */
interface EnrollmentListProps {
  enrollments: Enrollment[];
  onEdit?: (enrollment: Enrollment) => void;
  onRecordPayment?: (enrollment: Enrollment) => void;
  onDownloadReceipt?: (enrollmentId: string) => void;
  isLoading?: boolean;
}

/**
 * Get badge variant based on enrollment status
 */
const getStatusBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get payment status badge variant
 */
const getPaymentBadgeVariant = (paidAmount: number, totalAmount: number): 'default' | 'success' | 'warning' | 'error' => {
  const percentage = (paidAmount / totalAmount) * 100;
  if (percentage >= 100) return 'success';
  if (percentage >= 50) return 'warning';
  if (percentage > 0) return 'default';
  return 'error';
};

/**
 * Format date to readable string
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * EnrollmentList Component
 */
export const EnrollmentList: React.FC<EnrollmentListProps> = ({
  enrollments,
  onEdit,
  onRecordPayment,
  onDownloadReceipt,
  isLoading = false,
}) => {
  /**
   * Empty state
   */
  if (!isLoading && enrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-primary/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#003300] mb-2">No enrollments found</h3>
        <p className="text-[#003300]/60">
          Try adjusting your filters or create a new enrollment
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-primary/10 bg-[#f9fafb]">
            <th className="text-left py-4 px-4 text-sm font-semibold text-[#003300]/70 uppercase tracking-wider">
              Student
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-[#003300]/70 uppercase tracking-wider">
              Course
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-[#003300]/70 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-[#003300]/70 uppercase tracking-wider">
              Payment
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-[#003300]/70 uppercase tracking-wider">
              Enrolled
            </th>
            {onEdit && (
              <th className="text-right py-4 px-4 text-sm font-semibold text-[#003300]/70 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-primary/5">
          {enrollments.map((enrollment) => (
            <tr
              key={enrollment._id}
              className="hover:bg-primary/5 transition-colors duration-150"
            >
              {/* Student Column */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#004d00] flex items-center justify-center text-[#ffffcc] font-semibold shadow-md">
                    {enrollment.student.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name and Email */}
                  <div>
                    <p className="font-medium text-[#003300]">{enrollment.student.name}</p>
                    <p className="text-sm text-[#003300]/50">{enrollment.student.email}</p>
                  </div>
                </div>
              </td>

              {/* Course Column */}
              <td className="py-4 px-4">
                <p className="text-[#003300] font-medium">{enrollment.course.title}</p>
                {enrollment.course.price && (
                  <p className="text-sm text-[#003300]/50">${enrollment.course.price}</p>
                )}
              </td>

              {/* Status Column */}
              <td className="py-4 px-4">
                <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                  {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                </Badge>
              </td>

              {/* Payment Column */}
              <td className="py-4 px-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#003300]/70">
                    <DollarSign className="w-4 h-4 text-primary/50" />
                    <span className="text-sm">
                      ${enrollment.payment.paidAmount} / ${enrollment.payment.totalAmount}
                    </span>
                  </div>
                  <Badge variant={getPaymentBadgeVariant(enrollment.payment.paidAmount, enrollment.payment.totalAmount)} size="sm">
                    {enrollment.payment.remainingAmount > 0
                      ? `$${enrollment.payment.remainingAmount} remaining`
                      : 'Paid in full'}
                  </Badge>
                </div>
              </td>

              {/* Enrolled Date Column */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 text-[#003300]/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(enrollment.enrolledAt)}</span>
                </div>
              </td>

              {/* Actions Column */}
              {(onEdit || onRecordPayment || onDownloadReceipt) && (
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* Show Payment button if there's remaining balance */}
                    {onRecordPayment && enrollment.payment.remainingAmount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<DollarSign className="w-4 h-4" />}
                        onClick={() => onRecordPayment(enrollment)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        Payment
                      </Button>
                    )}

                    {/* Show Download Receipt button if payment is complete */}
                    {onDownloadReceipt && enrollment.payment.remainingAmount === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Download className="w-4 h-4" />}
                        onClick={() => onDownloadReceipt(enrollment._id)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        Receipt
                      </Button>
                    )}

                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Edit2 className="w-4 h-4" />}
                        onClick={() => onEdit(enrollment)}
                        className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
