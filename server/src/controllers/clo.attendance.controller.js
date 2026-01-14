/**
 * CLO Attendance Controller
 *
 * Handles viewing attendance records for CLO oversight
 * CLO can view all attendance across all groups
 *
 * @controller CLOAttendanceController
 * @description CLO attendance viewing operations
 */

const Attendance = require('../models/Attendance');
const Group = require('../models/Group');
const Course = require('../models/Course');

/**
 * @route   GET /api/clo/attendance
 * @desc    Get all attendance records with filters
 * @access  CLO only
 */
exports.getAllAttendance = async (req, res) => {
  try {
    const {
      courseId,
      groupId,
      startDate,
      endDate,
      sessionType,
      page = 1,
      limit = 20,
      sortBy = 'session.date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (courseId) query.course = courseId;
    if (sessionType) query['session.type'] = sessionType;

    if (startDate || endDate) {
      query['session.date'] = {};
      if (startDate) query['session.date'].$gte = new Date(startDate);
      if (endDate) query['session.date'].$lte = new Date(endDate);
    }

    // If filtering by group, first get the course ID
    if (groupId) {
      const group = await Group.findById(groupId);
      if (group) {
        query.course = group.courseId;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'course',
        select: 'title category level'
      })
      .populate({
        path: 'records.student',
        select: 'name email'
      })
      .populate({
        path: 'records.markedBy',
        select: 'name'
      })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Attendance.countDocuments(query);

    // Calculate statistics for each record
    const enrichedRecords = attendanceRecords.map(record => {
      const totalStudents = record.records.length;
      const present = record.records.filter(r => r.status === 'present').length;
      const absent = record.records.filter(r => r.status === 'absent').length;
      const late = record.records.filter(r => r.status === 'late').length;
      const excused = record.records.filter(r => r.status === 'excused').length;
      const attendanceRate = totalStudents > 0 ? Math.round(((present + late) / totalStudents) * 100) : 0;

      return {
        ...record,
        stats: {
          totalStudents,
          present,
          absent,
          late,
          excused,
          attendanceRate
        }
      };
    });

    res.json({
      success: true,
      data: enrichedRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch attendance'
    });
  }
};

/**
 * @route   GET /api/clo/attendance/:id
 * @desc    Get a single attendance record by ID
 * @access  CLO only
 */
exports.getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id)
      .populate({
        path: 'course',
        select: 'title category level'
      })
      .populate({
        path: 'records.student',
        select: 'name email profile'
      })
      .populate({
        path: 'records.markedBy',
        select: 'name email'
      })
      .lean();

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Calculate statistics
    const totalStudents = attendance.records.length;
    const present = attendance.records.filter(r => r.status === 'present').length;
    const absent = attendance.records.filter(r => r.status === 'absent').length;
    const late = attendance.records.filter(r => r.status === 'late').length;
    const excused = attendance.records.filter(r => r.status === 'excused').length;
    const attendanceRate = totalStudents > 0 ? Math.round(((present + late) / totalStudents) * 100) : 0;

    res.json({
      success: true,
      data: {
        ...attendance,
        stats: {
          totalStudents,
          present,
          absent,
          late,
          excused,
          attendanceRate
        }
      }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch attendance'
    });
  }
};

/**
 * @route   GET /api/clo/attendance/course/:courseId
 * @desc    Get all attendance for a specific course
 * @access  CLO only
 */
exports.getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;

    const attendanceRecords = await Attendance.find({ course: courseId })
      .populate({
        path: 'records.student',
        select: 'name email'
      })
      .sort({ 'session.date': -1 })
      .lean();

    // Calculate course-wide statistics
    let totalSessions = attendanceRecords.length;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;
    let totalStudentRecords = 0;

    attendanceRecords.forEach(record => {
      totalStudentRecords += record.records.length;
      totalPresent += record.records.filter(r => r.status === 'present').length;
      totalAbsent += record.records.filter(r => r.status === 'absent').length;
      totalLate += record.records.filter(r => r.status === 'late').length;
      totalExcused += record.records.filter(r => r.status === 'excused').length;
    });

    const overallAttendanceRate = totalStudentRecords > 0
      ? Math.round(((totalPresent + totalLate) / totalStudentRecords) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        attendanceRecords,
        stats: {
          totalSessions,
          totalPresent,
          totalAbsent,
          totalLate,
          totalExcused,
          overallAttendanceRate
        }
      }
    });
  } catch (error) {
    console.error('Error fetching course attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch course attendance'
    });
  }
};

/**
 * @route   GET /api/clo/attendance/stats
 * @desc    Get overall attendance statistics
 * @access  CLO only
 */
exports.getAttendanceStats = async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    const query = {};
    if (courseId) query.course = courseId;
    if (startDate || endDate) {
      query['session.date'] = {};
      if (startDate) query['session.date'].$gte = new Date(startDate);
      if (endDate) query['session.date'].$lte = new Date(endDate);
    }

    const attendanceRecords = await Attendance.find(query).lean();

    if (attendanceRecords.length === 0) {
      return res.json({
        success: true,
        data: {
          totalSessions: 0,
          totalStudentRecords: 0,
          overallAttendanceRate: 0,
          statusDistribution: {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
          },
          averageSessionAttendance: 0
        }
      });
    }

    let totalSessions = attendanceRecords.length;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;
    let totalStudentRecords = 0;
    let sessionAttendanceRates = [];

    attendanceRecords.forEach(record => {
      const sessionTotal = record.records.length;
      const sessionPresent = record.records.filter(r => r.status === 'present').length;
      const sessionLate = record.records.filter(r => r.status === 'late').length;

      if (sessionTotal > 0) {
        sessionAttendanceRates.push(((sessionPresent + sessionLate) / sessionTotal) * 100);
      }

      totalStudentRecords += sessionTotal;
      totalPresent += sessionPresent;
      totalAbsent += record.records.filter(r => r.status === 'absent').length;
      totalLate += sessionLate;
      totalExcused += record.records.filter(r => r.status === 'excused').length;
    });

    const overallAttendanceRate = totalStudentRecords > 0
      ? Math.round(((totalPresent + totalLate) / totalStudentRecords) * 100)
      : 0;

    const averageSessionAttendance = sessionAttendanceRates.length > 0
      ? Math.round(sessionAttendanceRates.reduce((a, b) => a + b, 0) / sessionAttendanceRates.length)
      : 0;

    res.json({
      success: true,
      data: {
        totalSessions,
        totalStudentRecords,
        overallAttendanceRate,
        statusDistribution: {
          present: totalPresent,
          absent: totalAbsent,
          late: totalLate,
          excused: totalExcused
        },
        averageSessionAttendance
      }
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch attendance statistics'
    });
  }
};

module.exports = exports;
