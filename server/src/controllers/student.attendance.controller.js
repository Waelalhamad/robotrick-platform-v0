const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');

// @desc    Get attendance overview for all enrolled courses
// @route   GET /api/student/attendance/overview
// @access  Private (Student)
exports.getAttendanceOverview = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Get all active enrollments
  const enrollments = await Enrollment.find({
    student: studentId,
    status: { $in: ['active', 'completed'] }
  }).populate('course', 'title thumbnail');

  if (!enrollments || enrollments.length === 0) {
    return res.json({
      success: true,
      data: {
        courses: [],
        overallStats: {
          totalCourses: 0,
          averageAttendance: 0,
          totalSessions: 0,
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0
        },
        recentAttendance: []
      }
    });
  }

  // Get attendance data for all courses
  const courseAttendanceData = await Promise.all(
    enrollments.map(async (enrollment) => {
      const courseId = enrollment.course._id;

      // Get attendance records for this course
      const attendanceRecords = await Attendance.find({
        course: courseId,
        'records.student': studentId
      }).select('records session').sort({ 'session.date': -1 });

      // Calculate stats for this course
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      attendanceRecords.forEach(record => {
        const studentRecord = record.records.find(
          r => r.student.toString() === studentId.toString()
        );

        if (studentRecord) {
          switch (studentRecord.status) {
            case 'present':
              presentCount++;
              break;
            case 'absent':
              absentCount++;
              break;
            case 'late':
              lateCount++;
              break;
            case 'excused':
              excusedCount++;
              break;
          }
        } else {
          absentCount++;
        }
      });

      const totalSessions = attendanceRecords.length;
      const attendedSessions = presentCount + lateCount;
      const attendancePercentage = totalSessions > 0
        ? Math.round((attendedSessions / totalSessions) * 100)
        : 0;

      return {
        courseId: courseId.toString(),
        courseTitle: enrollment.course.title,
        courseThumbnail: enrollment.course.thumbnail,
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendancePercentage
      };
    })
  );

  // Calculate overall stats
  const overallStats = {
    totalCourses: courseAttendanceData.length,
    averageAttendance: courseAttendanceData.length > 0
      ? Math.round(
          courseAttendanceData.reduce((sum, course) => sum + course.attendancePercentage, 0) / courseAttendanceData.length
        )
      : 0,
    totalSessions: courseAttendanceData.reduce((sum, course) => sum + course.totalSessions, 0),
    totalPresent: courseAttendanceData.reduce((sum, course) => sum + course.presentCount, 0),
    totalAbsent: courseAttendanceData.reduce((sum, course) => sum + course.absentCount, 0),
    totalLate: courseAttendanceData.reduce((sum, course) => sum + course.lateCount, 0)
  };

  // Get recent attendance across all courses (last 10 sessions)
  const allAttendanceRecords = await Attendance.find({
    'records.student': studentId
  })
    .populate('course', 'title')
    .select('session records course')
    .sort({ 'session.date': -1 })
    .limit(10);

  const recentAttendance = allAttendanceRecords.map(record => {
    const studentRecord = record.records.find(
      r => r.student.toString() === studentId.toString()
    );

    return {
      _id: record._id,
      courseTitle: record.course.title,
      status: studentRecord ? studentRecord.status : 'absent',
      checkInTime: studentRecord ? studentRecord.checkInTime : null,
      session: {
        title: record.session.title,
        date: record.session.date,
        startTime: record.session.startTime,
        endTime: record.session.endTime,
        type: record.session.type
      }
    };
  });

  logger.info('Attendance overview retrieved', {
    studentId,
    coursesCount: courseAttendanceData.length,
    averageAttendance: overallStats.averageAttendance
  });

  res.json({
    success: true,
    data: {
      courses: courseAttendanceData,
      overallStats,
      recentAttendance
    }
  });
});

// @desc    Get attendance for a course
// @route   GET /api/student/attendance/courses/:courseId
// @access  Private (Student)
exports.getCourseAttendance = asyncHandler(async (req, res) => {
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

  // Get all attendance records for this course
  const attendanceRecords = await Attendance.find({
    course: courseId,
    'records.student': studentId
  })
    .select('session records')
    .sort({ 'session.date': -1 });

  // Extract student's attendance from each session - matching frontend AttendanceRecord interface
  const studentAttendance = attendanceRecords.map(record => {
    const studentRecord = record.records.find(
      r => r.student.toString() === studentId.toString()
    );

    return {
      _id: record._id,
      status: studentRecord ? studentRecord.status : 'absent',
      checkInTime: studentRecord ? studentRecord.checkInTime : null,
      session: {
        title: record.session.title,
        date: record.session.date,
        startTime: record.session.startTime,
        endTime: record.session.endTime,
        type: record.session.type
      }
    };
  });

  logger.info('Course attendance retrieved', {
    studentId,
    courseId,
    sessionCount: studentAttendance.length
  });

  res.json({
    success: true,
    count: studentAttendance.length,
    data: studentAttendance
  });
});

// @desc    Get attendance summary for a course
// @route   GET /api/student/attendance/summary/:courseId
// @access  Private (Student)
exports.getAttendanceSummary = asyncHandler(async (req, res) => {
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

  // Get all attendance records to calculate stats
  const attendanceRecords = await Attendance.find({
    course: courseId,
    'records.student': studentId
  }).select('records');

  // Calculate stats matching frontend AttendanceStats interface
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  attendanceRecords.forEach(record => {
    const studentRecord = record.records.find(
      r => r.student.toString() === studentId.toString()
    );

    if (studentRecord) {
      switch (studentRecord.status) {
        case 'present':
          presentCount++;
          break;
        case 'absent':
          absentCount++;
          break;
        case 'late':
          lateCount++;
          break;
        case 'excused':
          excusedCount++;
          break;
      }
    } else {
      absentCount++; // If no record, count as absent
    }
  });

  const totalSessions = attendanceRecords.length;
  const attendedSessions = presentCount + lateCount; // Present + Late = Attended
  const attendancePercentage = totalSessions > 0
    ? Math.round((attendedSessions / totalSessions) * 100)
    : 0;

  const stats = {
    totalSessions,
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    attendancePercentage
  };

  logger.info('Attendance summary retrieved', {
    studentId,
    courseId,
    percentage: attendancePercentage
  });

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Get attendance by month
// @route   GET /api/student/attendance/courses/:courseId/month/:year/:month
// @access  Private (Student)
exports.getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { courseId, year, month } = req.params;
  const studentId = req.user._id;

  // Validate year and month
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    throw new AppError('Invalid year or month', 400);
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['active', 'completed'] }
  });

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  // Get start and end date for the month
  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

  // Get attendance for the month
  const attendanceRecords = await Attendance.find({
    course: courseId,
    'records.student': studentId,
    'session.date': {
      $gte: startDate,
      $lte: endDate
    }
  })
    .select('session records')
    .sort({ 'session.date': 1 });

  // Format for calendar view
  const calendarData = attendanceRecords.map(record => {
    const studentRecord = record.records.find(
      r => r.student.toString() === studentId.toString()
    );

    return {
      date: record.session.date,
      status: studentRecord ? studentRecord.status : 'absent',
      session: {
        title: record.session.title,
        startTime: record.session.startTime,
        endTime: record.session.endTime,
        type: record.session.type
      }
    };
  });

  res.json({
    success: true,
    month: `${yearNum}-${String(monthNum).padStart(2, '0')}`,
    count: calendarData.length,
    data: calendarData
  });
});

module.exports = exports;
