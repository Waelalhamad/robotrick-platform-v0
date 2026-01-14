const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const Enrollment = require('../models/Enrollment');
const ModuleProgress = require('../models/ModuleProgress');
const QuizAttempt = require('../models/QuizAttempt');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Assignment = require('../models/Assignment');

// @desc    Get dashboard statistics
// @route   GET /api/student/dashboard/stats
// @access  Private (Student)
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Get all enrollments
  const enrollments = await Enrollment.find({
    student: studentId,
    status: { $in: ['active', 'completed'] }
  }).populate('course', 'title');

  // Calculate stats
  const stats = {
    totalEnrolledCourses: enrollments.length,
    activeCourses: enrollments.filter(e => e.status === 'active').length,
    completedCourses: enrollments.filter(e => e.status === 'completed').length,

    // Progress stats
    totalModulesCompleted: 0,
    averageProgress: 0,

    // Attendance stats
    averageAttendance: 0,

    // Payment stats
    totalPaid: 0,
    totalRemaining: 0,
    overduePayments: 0,

    // Quiz stats
    totalQuizzesTaken: 0,
    averageQuizScore: null,

    // Assignment stats
    totalAssignmentsSubmitted: 0,
    pendingAssignments: 0
  };

  // Calculate totals from enrollments
  let totalProgress = 0;
  let totalAttendance = 0;
  let courseCount = 0;

  enrollments.forEach(enrollment => {
    stats.totalModulesCompleted += enrollment.progress.completedModules.length;
    totalProgress += enrollment.progress.percentageComplete;
    totalAttendance += enrollment.attendance.percentage;
    stats.totalPaid += enrollment.payment.paidAmount;
    stats.totalRemaining += enrollment.payment.remainingAmount;
    courseCount++;
  });

  if (courseCount > 0) {
    stats.averageProgress = Math.round(totalProgress / courseCount);
    stats.averageAttendance = Math.round(totalAttendance / courseCount);
  }

  // Get recent quiz attempts (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get quiz stats
  try {
    const allQuizAttempts = await QuizAttempt.find({
      student: studentId,
      status: 'submitted'
    });

    stats.totalQuizzesTaken = allQuizAttempts.length;

    // Calculate average quiz score
    if (allQuizAttempts.length > 0) {
      const totalScore = allQuizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
      stats.averageQuizScore = Math.round(totalScore / allQuizAttempts.length);
    }
  } catch (err) {
    console.error('Error fetching quiz stats:', err);
  }

  // Get assignment stats
  try {
    const allAssignments = await AssignmentSubmission.find({
      student: studentId
    });

    stats.totalAssignmentsSubmitted = allAssignments.filter(a => a.status !== 'draft').length;
    stats.pendingAssignments = allAssignments.filter(a => a.status === 'submitted').length;
  } catch (err) {
    console.error('Error fetching assignment stats:', err);
  }

  // Check for overdue payments
  const now = new Date();
  enrollments.forEach(enrollment => {
    if (enrollment.payment.installments) {
      const overdueCount = enrollment.payment.installments.filter(
        inst => inst.status === 'pending' && new Date(inst.dueDate) < now
      ).length;
      stats.overduePayments += overdueCount;
    }
  });

  logger.info('Dashboard stats retrieved', {
    studentId,
    activeCourses: stats.activeCourses
  });

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Get recent activity
// @route   GET /api/student/dashboard/recent-activity
// @access  Private (Student)
exports.getRecentActivity = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const limit = parseInt(req.query.limit) || 10;

  // For now, return recent enrollments and payment activities
  const activities = [];

  try {
    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({
      student: studentId
    })
      .populate('course', 'title')
      .sort({ enrolledAt: -1 })
      .limit(limit);

    recentEnrollments.forEach(enrollment => {
      activities.push({
        _id: enrollment._id.toString(),
        type: 'module',
        title: `Enrolled in ${enrollment.course.title}`,
        description: `Started course: ${enrollment.course.title}`,
        courseTitle: enrollment.course.title,
        timestamp: enrollment.enrolledAt,
        status: enrollment.status
      });
    });

    // Get recent payments from receipts
    const Receipt = require('../models/Receipt');
    const recentPayments = await Receipt.find({
      student: studentId
    })
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);

    recentPayments.forEach(payment => {
      activities.push({
        _id: payment._id.toString(),
        type: 'payment',
        title: `Payment of $${payment.payment.amount}`,
        description: `Paid $${payment.payment.amount} for ${payment.course.title}`,
        courseTitle: payment.course.title,
        timestamp: payment.createdAt,
        status: 'completed'
      });
    });

  } catch (err) {
    console.error('Error fetching activities:', err);
  }

  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Limit results
  const limitedActivities = activities.slice(0, limit);

  res.json({
    success: true,
    count: limitedActivities.length,
    data: limitedActivities
  });
});

// @desc    Get upcoming deadlines
// @route   GET /api/student/dashboard/upcoming-deadlines
// @access  Private (Student)
exports.getUpcomingDeadlines = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const days = parseInt(req.query.days) || 7; // Default 7 days

  const deadlines = [];
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  try {
    // Get student's active enrollments
    const enrollments = await Enrollment.find({
      student: studentId,
      status: 'active'
    }).populate('course', 'title');

    // Get upcoming payment installments
    for (const enrollment of enrollments) {
      if (enrollment.payment.installments) {
        const pendingInstallments = enrollment.payment.installments.filter(
          inst => inst.status === 'pending' && new Date(inst.dueDate) >= now && new Date(inst.dueDate) <= futureDate
        );

        pendingInstallments.forEach(inst => {
          const daysUntilDue = Math.ceil((new Date(inst.dueDate) - now) / (1000 * 60 * 60 * 24));

          deadlines.push({
            _id: inst._id.toString(),
            type: 'payment',
            title: `Payment for ${enrollment.course.title}`,
            courseTitle: enrollment.course.title,
            dueDate: inst.dueDate,
            priority: daysUntilDue <= 1 ? 'high' : daysUntilDue <= 3 ? 'medium' : 'low',
            status: 'pending'
          });
        });
      }
    }

    // Try to get assignments if the model exists
    try {
      const courseIds = enrollments.map(e => e.course);
      const upcomingAssignments = await Assignment.find({
        course: { $in: courseIds },
        dueDate: { $gte: now, $lte: futureDate },
        isActive: true
      })
        .populate('course', 'title')
        .sort({ dueDate: 1 });

      upcomingAssignments.forEach(assignment => {
        const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - now) / (1000 * 60 * 60 * 24));

        deadlines.push({
          _id: assignment._id.toString(),
          type: 'assignment',
          title: assignment.title,
          courseTitle: assignment.course.title,
          dueDate: assignment.dueDate,
          priority: daysUntilDue <= 1 ? 'high' : daysUntilDue <= 3 ? 'medium' : 'low',
          status: 'pending'
        });
      });
    } catch (err) {
      // Assignments model may not exist yet
      console.log('No assignments found');
    }

  } catch (err) {
    console.error('Error fetching deadlines:', err);
  }

  // Sort by due date
  deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  res.json({
    success: true,
    count: deadlines.length,
    data: deadlines
  });
});

// @desc    Get course progress overview
// @route   GET /api/student/dashboard/progress
// @access  Private (Student)
exports.getProgressOverview = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const enrollments = await Enrollment.find({
    student: studentId,
    status: { $in: ['active', 'completed'] }
  })
    .populate('course', 'title thumbnail category')
    .sort({ enrolledAt: -1 });

  // Get sessions count for each course
  const Session = require('../models/Session');
  const Group = require('../models/Group');

  const progressData = await Promise.all(enrollments.map(async (enrollment) => {
    // Find student's group for this course
    const group = await Group.findOne({
      courseId: enrollment.course._id,
      students: studentId
    });

    let totalSessions = 0;
    if (group) {
      // Count sessions for this group
      totalSessions = await Session.countDocuments({
        groupId: group._id,
        courseId: enrollment.course._id
      });
    }

    return {
      courseId: enrollment.course._id.toString(),
      courseTitle: enrollment.course.title,
      progress: enrollment.progress.percentageComplete || 0,
      completedModules: enrollment.progress.completedModules ? enrollment.progress.completedModules.length : 0,
      totalModules: totalSessions,
      status: enrollment.status
    };
  }));

  res.json({
    success: true,
    count: progressData.length,
    data: progressData
  });
});

module.exports = exports;
