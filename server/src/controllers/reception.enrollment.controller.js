/**
 * Reception Enrollment Controller
 *
 * Handles enrollment operations for reception staff:
 * - Create new enrollments (register students in courses)
 * - View all enrollments with filters
 * - Update enrollment status
 * - Set up payment plans with installments
 */

const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Group = require('../models/Group');
const Payment = require('../models/Payment');

/**
 * @desc    Get all enrollments with filters
 * @route   GET /api/reception/enrollments
 * @access  Private/Reception
 */
const getAllEnrollments = async (req, res) => {
  try {
    const { course, student, status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (course) query.course = course;
    if (student) query.student = student;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch enrollments with populated fields
    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email')
      .populate('course', 'title price')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Enrollment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: enrollments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: error.message
    });
  }
};

/**
 * @desc    Create new enrollment
 * @route   POST /api/reception/enrollments
 * @access  Private/Reception
 */
const createEnrollment = async (req, res) => {
  try {
    const { studentId, courseId, groupId, totalAmount, installmentPlan, notes } = req.body;

    // Validate required fields
    if (!studentId || !courseId || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Student, course, and total amount are required'
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }

    // Create installment schedule
    const installments = [];
    if (installmentPlan && installmentPlan.numberOfInstallments > 0) {
      const installmentAmount = totalAmount / installmentPlan.numberOfInstallments;
      const startDate = installmentPlan.startDate ? new Date(installmentPlan.startDate) : new Date();

      for (let i = 0; i < installmentPlan.numberOfInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        installments.push({
          amount: Math.round(installmentAmount * 100) / 100, // Round to 2 decimals
          dueDate,
          status: 'pending'
        });
      }
    } else {
      // Single payment
      installments.push({
        amount: totalAmount,
        dueDate: new Date(),
        status: 'pending'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      payment: {
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        installments
      },
      notes: notes || ''
    });

    // Add student to group if specified
    if (groupId) {
      const group = await Group.findById(groupId);
      if (group) {
        if (!group.students.includes(studentId)) {
          group.students.push(studentId);
          await group.save();
        }
      }
    }

    // Populate and return
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('student', 'name email')
      .populate('course', 'title price');

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      data: populatedEnrollment
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating enrollment',
      error: error.message
    });
  }
};

/**
 * @desc    Update enrollment
 * @route   PUT /api/reception/enrollments/:id
 * @access  Private/Reception
 */
const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Update fields
    if (status) enrollment.status = status;
    if (notes !== undefined) enrollment.notes = notes;

    // If status is completed, set completedAt
    if (status === 'completed' && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('student', 'name email')
      .populate('course', 'title price');

    res.status(200).json({
      success: true,
      message: 'Enrollment updated successfully',
      data: populatedEnrollment
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating enrollment',
      error: error.message
    });
  }
};

/**
 * @desc    Record a payment for an enrollment
 * @route   POST /api/reception/enrollments/:id/payment
 * @access  Private/Reception
 */
const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    const enrollment = await Enrollment.findById(id)
      .populate('student', 'name email')
      .populate('course', 'title price');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if payment would exceed total amount
    const newPaidAmount = enrollment.payment.paidAmount + parseFloat(amount);
    if (newPaidAmount > enrollment.payment.totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount exceeds remaining balance. Remaining: $${enrollment.payment.remainingAmount}`
      });
    }

    // Update payment information
    enrollment.payment.paidAmount = newPaidAmount;
    enrollment.payment.remainingAmount = enrollment.payment.totalAmount - newPaidAmount;
    enrollment.payment.lastPaymentDate = new Date();

    // Add to payment history
    if (!enrollment.payment.paymentHistory) {
      enrollment.payment.paymentHistory = [];
    }
    enrollment.payment.paymentHistory.push({
      amount: parseFloat(amount),
      date: new Date(),
      method: paymentMethod || 'cash',
      notes: notes || '',
      receivedBy: req.user.id
    });

    await enrollment.save();

    // ========== AUTO-GENERATE RECEIPT ==========
    const Receipt = require('../models/Receipt');
    const { generateReceipt } = require('../utils/receiptGenerator');
    const path = require('path');
    const fs = require('fs');

    let receiptData = null;

    try {
      // Generate unique receipt number
      const receiptNumber = await Receipt.generateReceiptNumber();

      // Calculate billing info
      const billing = {
        totalAmount: enrollment.payment.totalAmount,
        paidBefore: enrollment.payment.paidAmount - parseFloat(amount),
        paidNow: parseFloat(amount),
        remainingBalance: enrollment.payment.remainingAmount
      };

      // Prepare receipt data
      const pdfReceiptData = {
        receiptNumber,
        student: {
          name: enrollment.student.name,
          email: enrollment.student.email
        },
        course: {
          title: enrollment.course.title
        },
        payment: {
          amount: parseFloat(amount),
          method: paymentMethod || 'cash',
          date: new Date(),
          notes: notes || ''
        },
        billing,
        issuedBy: {
          name: req.user.name
        }
      };

      // Generate PDF
      const fileName = `${receiptNumber}.pdf`;
      const uploadsDir = path.join(__dirname, '../../uploads/receipts');

      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const pdfPath = path.join(uploadsDir, fileName);
      await generateReceipt(pdfReceiptData, pdfPath);

      // Save receipt to database
      const receipt = await Receipt.create({
        receiptNumber,
        enrollment: enrollment._id,
        student: enrollment.student._id,
        course: enrollment.course._id,
        payment: {
          amount: parseFloat(amount),
          method: paymentMethod || 'cash',
          date: new Date(),
          notes: notes || ''
        },
        billing,
        pdfPath: `uploads/receipts/${fileName}`,
        issuedBy: req.user.id
      });

      receiptData = {
        receiptId: receipt._id,
        receiptNumber: receipt.receiptNumber,
        downloadUrl: `/api/reception/receipts/${receipt._id}/download`
      };

    } catch (receiptError) {
      console.error('Error generating receipt (payment still recorded):', receiptError);
      // Continue - payment is recorded even if receipt generation fails
    }

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('student', 'name email')
      .populate('course', 'title price');

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: populatedEnrollment,
      receipt: receiptData
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
};

/**
 * @desc    Get available courses for enrollment
 * @route   GET /api/reception/enrollments/available-courses
 * @access  Private/Reception
 */
const getAvailableCourses = async (req, res) => {
  try {
    // Get all published courses
    const courses = await Course.find({ status: 'published' })
      .select('title description price category level instructor')
      .populate('instructor', 'name')
      .sort({ title: 1 });

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available courses',
      error: error.message
    });
  }
};

/**
 * @desc    Get available groups for a course
 * @route   GET /api/reception/enrollments/available-groups/:courseId
 * @access  Private/Reception
 */
const getAvailableGroups = async (req, res) => {
  try {
    const { courseId } = req.params;

    const groups = await Group.find({
      courseId,
      status: 'active'
    })
      .populate('trainerId', 'name')
      .select('name trainerId maxStudents students schedule startDate endDate')
      .sort({ name: 1 });

    // Add availability info
    const groupsWithAvailability = groups.map(group => ({
      ...group.toObject(),
      availableSeats: group.maxStudents - group.students.length,
      isFull: group.students.length >= group.maxStudents
    }));

    res.status(200).json({
      success: true,
      data: groupsWithAvailability
    });
  } catch (error) {
    console.error('Error fetching available groups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available groups',
      error: error.message
    });
  }
};

/**
 * @desc    Get students for dropdown (not enrolled in specific course)
 * @route   GET /api/reception/enrollments/available-students
 * @access  Private/Reception
 */
const getAvailableStudents = async (req, res) => {
  try {
    const { courseId } = req.query;

    let students;

    if (courseId) {
      // Get students not enrolled in this course
      const enrolledStudents = await Enrollment.find({
        course: courseId,
        status: { $in: ['active', 'completed'] }
      }).distinct('student');

      students = await User.find({
        role: 'student',
        _id: { $nin: enrolledStudents }
      })
        .select('name email')
        .sort({ name: 1 });
    } else {
      // Get all students
      students = await User.find({ role: 'student' })
        .select('name email')
        .sort({ name: 1 });
    }

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching available students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available students',
      error: error.message
    });
  }
};

module.exports = {
  getAllEnrollments,
  createEnrollment,
  updateEnrollment,
  recordPayment,
  getAvailableCourses,
  getAvailableGroups,
  getAvailableStudents
};
