const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  session: {
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    date: {
      type: Date,
      required: [true, 'Session date is required']
    },
    startTime: {
      type: String, // "10:00 AM"
      trim: true
    },
    endTime: {
      type: String, // "12:00 PM"
      trim: true
    },
    type: {
      type: String,
      enum: ['lecture', 'lab', 'workshop', 'exam', 'project', 'other'],
      default: 'lecture'
    },
    location: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  records: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent'
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    checkInTime: {
      type: Date,
      default: null
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
AttendanceSchema.index({ course: 1, 'session.date': 1 });
AttendanceSchema.index({ 'records.student': 1 });
AttendanceSchema.index({ course: 1, 'session.type': 1 });

// Method to mark student attendance
AttendanceSchema.methods.markAttendance = function(studentId, status, markedBy, notes = null) {
  const existingRecord = this.records.find(
    r => r.student.toString() === studentId.toString()
  );

  if (existingRecord) {
    existingRecord.status = status;
    existingRecord.markedBy = markedBy;
    existingRecord.markedAt = new Date();
    if (notes) existingRecord.notes = notes;
    if (status === 'present' || status === 'late') {
      existingRecord.checkInTime = new Date();
    }
  } else {
    this.records.push({
      student: studentId,
      status: status,
      markedBy: markedBy,
      markedAt: new Date(),
      notes: notes,
      checkInTime: (status === 'present' || status === 'late') ? new Date() : null
    });
  }
};

// Method to get attendance for a student
AttendanceSchema.methods.getStudentAttendance = function(studentId) {
  return this.records.find(
    r => r.student.toString() === studentId.toString()
  );
};

// Static method to get attendance summary for student
AttendanceSchema.statics.getStudentSummary = async function(courseId, studentId) {
  const sessions = await this.find({
    course: courseId,
    'records.student': studentId
  });

  const summary = {
    totalSessions: sessions.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0
  };

  sessions.forEach(session => {
    const record = session.records.find(
      r => r.student.toString() === studentId.toString()
    );
    if (record) {
      summary[record.status]++;
    }
  });

  if (summary.totalSessions > 0) {
    // Calculate percentage (present + late + excused as attended)
    const attended = summary.present + summary.late + summary.excused;
    summary.percentage = Math.round((attended / summary.totalSessions) * 100);
  }

  return summary;
};

// Static method to get course attendance overview
AttendanceSchema.statics.getCourseOverview = async function(courseId) {
  const sessions = await this.find({ course: courseId })
    .populate('records.student', 'name email')
    .sort({ 'session.date': -1 });

  return sessions;
};

module.exports = mongoose.model('Attendance', AttendanceSchema);
