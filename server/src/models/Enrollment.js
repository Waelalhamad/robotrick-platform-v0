const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  progress: {
    completedModules: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    }],
    currentModule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      default: null
    },
    percentageComplete: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastAccessedAt: {
      type: Date,
      default: null
    }
  },
  payment: {
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative']
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: [0, 'Remaining amount cannot be negative']
    },
    installments: [{
      amount: {
        type: Number,
        required: true,
        min: [0, 'Installment amount cannot be negative']
      },
      dueDate: {
        type: Date,
        required: true
      },
      paidDate: {
        type: Date,
        default: null
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
      },
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
      }
    }]
  },
  attendance: {
    totalSessions: {
      type: Number,
      default: 0,
      min: [0, 'Total sessions cannot be negative']
    },
    attendedSessions: {
      type: Number,
      default: 0,
      min: [0, 'Attended sessions cannot be negative']
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  grade: {
    quizAverage: {
      type: Number,
      default: null,
      min: 0,
      max: 100
    },
    assignmentAverage: {
      type: Number,
      default: null,
      min: 0,
      max: 100
    },
    overallGrade: {
      type: Number,
      default: null,
      min: 0,
      max: 100
    }
  },
  completedAt: {
    type: Date,
    default: null
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: {
      type: Date,
      default: null
    },
    certificateUrl: {
      type: String,
      default: null
    },
    certificateNumber: {
      type: String,
      default: null
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Compound index to ensure one enrollment per student per course
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ student: 1, status: 1 });
EnrollmentSchema.index({ course: 1, status: 1 });

// Pre-save middleware to calculate remaining amount
EnrollmentSchema.pre('save', function(next) {
  if (this.payment.totalAmount !== undefined && this.payment.paidAmount !== undefined) {
    this.payment.remainingAmount = this.payment.totalAmount - this.payment.paidAmount;
  }
  next();
});

// Method to update progress percentage
EnrollmentSchema.methods.updateProgressPercentage = async function(totalModules) {
  if (totalModules > 0) {
    this.progress.percentageComplete = Math.round(
      (this.progress.completedModules.length / totalModules) * 100
    );
  } else {
    this.progress.percentageComplete = 0;
  }
  await this.save();
};

// Method to update attendance percentage
EnrollmentSchema.methods.updateAttendancePercentage = function() {
  if (this.attendance.totalSessions > 0) {
    this.attendance.percentage = Math.round(
      (this.attendance.attendedSessions / this.attendance.totalSessions) * 100
    );
  } else {
    this.attendance.percentage = 0;
  }
};

// Static method to check if student is enrolled
EnrollmentSchema.statics.isEnrolled = async function(studentId, courseId) {
  const enrollment = await this.findOne({
    student: studentId,
    course: courseId,
    status: 'active'
  });
  return !!enrollment;
};

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
