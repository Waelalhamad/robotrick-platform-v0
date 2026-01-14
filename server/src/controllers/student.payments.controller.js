const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const Receipt = require('../models/Receipt');
const Enrollment = require('../models/Enrollment');

// @desc    Get payment history for a course
// @route   GET /api/student/payments/courses/:courseId
// @access  Private (Student)
exports.getCoursePayments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId
  }).populate('course', 'title');

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  // Get payments (receipts)
  const receipts = await Receipt.find({
    student: studentId,
    course: courseId
  })
    .populate('issuedBy', 'name')
    .sort({ createdAt: -1 });

  // Transform receipts to payment format
  const payments = receipts.map(receipt => ({
    _id: receipt._id,
    amount: receipt.payment.amount,
    paymentMethod: receipt.payment.method,
    transactionId: receipt.receiptNumber,
    status: 'completed',
    paidAt: receipt.payment.date,
    receipt: {
      receiptNumber: receipt.receiptNumber,
      receiptUrl: receipt.pdfPath,
      generatedAt: receipt.createdAt
    },
    notes: receipt.payment.notes,
    createdAt: receipt.createdAt
  }));

  logger.info('Course payments retrieved', {
    studentId,
    courseId,
    paymentCount: payments.length
  });

  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc    Get all payments for student
// @route   GET /api/student/payments
// @access  Private (Student)
exports.getAllPayments = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Get all receipts (payments)
  const receipts = await Receipt.find({
    student: studentId
  })
    .populate('course', 'title')
    .populate('issuedBy', 'name')
    .sort({ createdAt: -1 });

  // Transform receipts to payment format
  const payments = receipts.map(receipt => ({
    _id: receipt._id,
    amount: receipt.payment.amount,
    paymentMethod: receipt.payment.method,
    transactionId: receipt.receiptNumber,
    status: 'completed',
    paidAt: receipt.payment.date,
    receipt: {
      receiptNumber: receipt.receiptNumber,
      receiptUrl: receipt.pdfPath,
      generatedAt: receipt.createdAt
    },
    notes: receipt.payment.notes,
    createdAt: receipt.createdAt,
    course: receipt.course
  }));

  logger.info('All payments retrieved', {
    studentId,
    paymentCount: payments.length
  });

  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc    Get payment receipt (Download PDF)
// @route   GET /api/student/payments/:paymentId/receipt
// @access  Private (Student)
exports.getPaymentReceipt = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const studentId = req.user._id;

  const receipt = await Receipt.findOne({
    _id: paymentId,
    student: studentId
  });

  if (!receipt) {
    throw new AppError('Receipt not found', 404);
  }

  if (!receipt.pdfPath) {
    throw new AppError('Receipt PDF not available', 404);
  }

  logger.info('Receipt downloaded', {
    studentId,
    receiptId: paymentId,
    receiptNumber: receipt.receiptNumber
  });

  // Send PDF file
  const path = require('path');
  const filePath = path.join(__dirname, '../../', receipt.pdfPath);

  res.download(filePath, `${receipt.receiptNumber}.pdf`, (err) => {
    if (err) {
      console.error('Error downloading receipt:', err);
      if (!res.headersSent) {
        throw new AppError('Error downloading receipt', 500);
      }
    }
  });
});

// @desc    Initiate a payment
// @route   POST /api/student/payments/initiate
// @access  Private (Student)
exports.initiatePayment = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { enrollmentId, amount, paymentMethod, installmentNumber } = req.body;

  if (!enrollmentId || !amount || !paymentMethod) {
    throw new AppError('Enrollment ID, amount, and payment method are required', 400);
  }

  // Get enrollment
  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    student: studentId
  });

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  // Validate amount
  if (amount <= 0) {
    throw new AppError('Invalid amount', 400);
  }

  if (amount > enrollment.payment.remainingAmount) {
    throw new AppError('Amount exceeds remaining balance', 400);
  }

  // Create payment record
  const payment = await Payment.create({
    student: studentId,
    enrollment: enrollmentId,
    course: enrollment.course,
    amount,
    paymentMethod,
    status: 'pending',
    installmentNumber: installmentNumber || null
  });

  logger.info('Payment initiated', {
    studentId,
    enrollmentId,
    paymentId: payment._id,
    amount
  });

  res.status(201).json({
    success: true,
    message: 'Payment initiated. Please complete the payment process.',
    data: payment
  });
});

// @desc    Confirm payment (after external payment gateway)
// @route   POST /api/student/payments/:paymentId/confirm
// @access  Private (Student)
exports.confirmPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const studentId = req.user._id;
  const { transactionId } = req.body;

  const payment = await Payment.findOne({
    _id: paymentId,
    student: studentId,
    status: 'pending'
  });

  if (!payment) {
    throw new AppError('Payment not found or already processed', 404);
  }

  // Update payment
  payment.transactionId = transactionId;
  payment.markAsCompleted();
  await payment.save();

  // Update enrollment
  const enrollment = await Enrollment.findById(payment.enrollment);
  enrollment.payment.paidAmount += payment.amount;
  enrollment.payment.remainingAmount = enrollment.payment.totalAmount - enrollment.payment.paidAmount;

  // Update installment status if applicable
  if (payment.installmentNumber) {
    const installment = enrollment.payment.installments.find(
      inst => inst._id.toString() === payment.installmentNumber.toString()
    );
    if (installment) {
      installment.status = 'paid';
      installment.paidDate = new Date();
      installment.paymentId = payment._id;
    }
  }

  await enrollment.save();

  logger.info('Payment confirmed', {
    studentId,
    paymentId,
    amount: payment.amount,
    transactionId
  });

  res.json({
    success: true,
    message: 'Payment confirmed successfully',
    data: {
      payment,
      enrollment: {
        totalAmount: enrollment.payment.totalAmount,
        paidAmount: enrollment.payment.paidAmount,
        remainingAmount: enrollment.payment.remainingAmount
      }
    }
  });
});

// @desc    Get payment summary
// @route   GET /api/student/payments/summary
// @access  Private (Student)
exports.getPaymentSummary = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Get all enrollments
  const enrollments = await Enrollment.find({
    student: studentId
  }).populate('course', 'title');

  // Get all receipts (completed payments)
  const receipts = await Receipt.find({
    student: studentId
  });

  // Calculate summary matching frontend PaymentSummary interface
  const summary = {
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    totalPayments: receipts.length,
    completedPayments: receipts.length, // All receipts are completed payments
    pendingPayments: 0,
    overduePayments: 0,
    nextPaymentDue: null
  };

  const now = new Date();
  let earliestDue = null;

  enrollments.forEach(enrollment => {
    summary.totalAmount += enrollment.payment.totalAmount || 0;
    summary.paidAmount += enrollment.payment.paidAmount || 0;
    summary.remainingAmount += enrollment.payment.remainingAmount || 0;

    // Count pending installments
    if (enrollment.payment.installments && enrollment.payment.installments.length > 0) {
      enrollment.payment.installments.forEach(inst => {
        if (inst.status === 'pending') {
          summary.pendingPayments++;

          // Check if overdue
          if (new Date(inst.dueDate) < now) {
            summary.overduePayments++;
          }

          // Find earliest due date for next payment
          if (!earliestDue || new Date(inst.dueDate) < new Date(earliestDue.dueDate)) {
            earliestDue = {
              amount: inst.amount,
              dueDate: inst.dueDate,
              isOverdue: new Date(inst.dueDate) < now
            };
          }
        }
      });
    }
  });

  summary.nextPaymentDue = earliestDue;

  logger.info('Payment summary retrieved', {
    studentId,
    totalAmount: summary.totalAmount,
    paidAmount: summary.paidAmount,
    remainingAmount: summary.remainingAmount
  });

  res.json({
    success: true,
    data: summary
  });
});

module.exports = exports;
