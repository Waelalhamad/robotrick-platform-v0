const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Module = require('../models/Module');

// @desc    Get all enrolled courses for student
// @route   GET /api/student/courses
// @access  Private (Student)
exports.getMyCourses = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const enrollments = await Enrollment.find({
    student: studentId,
    status: { $in: ['active', 'completed'] }
  })
    .populate({
      path: 'course',
      select: 'title description instructor duration price thumbnail category level startDate endDate',
      populate: {
        path: 'instructor',
        select: 'name email'
      }
    })
    .sort({ enrolledAt: -1 });

  const coursesWithProgress = enrollments.map(enrollment => ({
    _id: enrollment._id,
    course: {
      _id: enrollment.course._id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      instructor: enrollment.course.instructor,
      duration: enrollment.course.duration,
      price: enrollment.course.price,
      thumbnail: enrollment.course.thumbnail,
      category: enrollment.course.category,
      level: enrollment.course.level,
      startDate: enrollment.course.startDate,
      endDate: enrollment.course.endDate
    },
    enrolledAt: enrollment.enrolledAt,
    status: enrollment.status,
    progress: enrollment.progress,
    attendance: enrollment.attendance,
    payment: {
      totalAmount: enrollment.payment.totalAmount,
      paidAmount: enrollment.payment.paidAmount,
      remainingAmount: enrollment.payment.remainingAmount
    }
  }));

  logger.info('Student courses retrieved', {
    studentId,
    count: coursesWithProgress.length
  });

  res.json({
    success: true,
    count: coursesWithProgress.length,
    data: coursesWithProgress
  });
});

// @desc    Get single course details for student
// @route   GET /api/student/courses/:courseId
// @access  Private (Student)
exports.getCourseDetails = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  // Check if student is enrolled
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['active', 'completed'] }
  });

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  // Get course with instructor details
  const course = await Course.findById(courseId)
    .populate('instructor', 'name email')
    .populate('modules');

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  logger.info('Course details retrieved', {
    studentId,
    courseId,
    courseName: course.title
  });

  res.json({
    success: true,
    data: {
      course,
      enrollment
    }
  });
});

// @desc    Get course sessions for student
// @route   GET /api/student/courses/:courseId/sessions
// @access  Private (Student)
exports.getCourseSessions = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['active', 'completed'] }
  });

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  // Get student's group for this course
  const Group = require('../models/Group');
  const group = await Group.findOne({
    courseId,
    students: studentId
  });

  if (!group) {
    return res.json({
      success: true,
      count: 0,
      data: []
    });
  }

  // Get sessions for the student's group
  const Session = require('../models/Session');
  const sessions = await Session.find({
    groupId: group._id,
    courseId
  })
    .populate('trainerId', 'name email')
    .sort({ sessionNumber: 1, scheduledDate: 1 });

  // Get quizzes for these sessions
  const Quiz = require('../models/Quiz');
  const sessionIds = sessions.map(s => s._id);
  const quizzes = await Quiz.find({
    session: { $in: sessionIds }
  }).select('session title passingScore timeLimit questions');

  // Get quiz attempts for this student
  const QuizAttempt = require('../models/QuizAttempt');
  const quizIds = quizzes.map(q => q._id);
  const quizAttempts = await QuizAttempt.find({
    student: studentId,
    quiz: { $in: quizIds }
  }).select('quiz score passed submittedAt');

  // Merge quizzes with sessions and add attempt info
  const sessionsWithQuizzes = sessions.map(session => {
    const sessionObj = session.toObject({ virtuals: true });
    const quiz = quizzes.find(q => q.session && q.session.toString() === session._id.toString());

    let quizAttempt = null;
    if (quiz) {
      // Find the best/latest attempt for this quiz
      const attempts = quizAttempts.filter(a => a.quiz.toString() === quiz._id.toString());
      if (attempts.length > 0) {
        // Get the best score or latest attempt
        quizAttempt = attempts.reduce((best, current) => {
          return current.score > best.score ? current : best;
        });
      }
    }

    return {
      ...sessionObj,
      quiz: quiz || null,
      quizAttempt: quizAttempt ? {
        score: quizAttempt.score,
        passed: quizAttempt.passed,
        submittedAt: quizAttempt.submittedAt
      } : null,
      isLocked: false, // Students can access all sessions for their group
      type: 'live_session'
    };
  });

  logger.info('Course sessions retrieved', {
    studentId,
    courseId,
    groupId: group._id,
    sessionCount: sessionsWithQuizzes.length
  });

  res.json({
    success: true,
    count: sessionsWithQuizzes.length,
    data: sessionsWithQuizzes
  });
});

// @desc    Enroll in a course
// @route   POST /api/student/courses/:courseId/enroll
// @access  Private (Student)
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;
  const { paymentPlan } = req.body; // 'full' or 'installment'

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if course is published
  if (course.status !== 'published') {
    throw new AppError('This course is not available for enrollment', 400);
  }

  // Check if course is full
  if (course.isFull) {
    throw new AppError('This course is full', 400);
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId
  });

  if (existingEnrollment) {
    throw new AppError('You are already enrolled in this course', 400);
  }

  // Create enrollment
  const enrollmentData = {
    student: studentId,
    course: courseId,
    status: 'active',
    payment: {
      totalAmount: course.price,
      paidAmount: 0,
      remainingAmount: course.price,
      installments: []
    }
  };

  // Setup payment installments if needed
  if (paymentPlan === 'installment') {
    const installmentAmount = Math.ceil(course.price / 3);
    const now = new Date();

    enrollmentData.payment.installments = [
      {
        amount: installmentAmount,
        dueDate: new Date(now.getTime() + 0), // Due now
        status: 'pending'
      },
      {
        amount: installmentAmount,
        dueDate: new Date(now.setMonth(now.getMonth() + 1)),
        status: 'pending'
      },
      {
        amount: course.price - (installmentAmount * 2), // Remaining
        dueDate: new Date(now.setMonth(now.getMonth() + 1)),
        status: 'pending'
      }
    ];
  }

  const enrollment = await Enrollment.create(enrollmentData);

  // Update course enrolled students count
  course.enrolledStudents += 1;
  await course.save();

  logger.info('Student enrolled in course', {
    studentId,
    courseId,
    courseName: course.title,
    paymentPlan
  });

  res.status(201).json({
    success: true,
    message: 'Successfully enrolled in course',
    data: enrollment
  });
});

// @desc    Get enrollment details
// @route   GET /api/student/enrollments/:enrollmentId
// @access  Private (Student)
exports.getEnrollmentDetails = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const studentId = req.user._id;

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    student: studentId
  })
    .populate('course', 'title description instructor duration price')
    .populate('progress.completedModules', 'title order')
    .populate('progress.currentModule', 'title order');

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  res.json({
    success: true,
    data: enrollment
  });
});

module.exports = exports;
