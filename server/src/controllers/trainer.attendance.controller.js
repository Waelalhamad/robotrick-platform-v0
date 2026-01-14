const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Group = require('../models/Group');

/**
 * @desc    Create/Update attendance record for a session
 * @route   POST /api/trainer/attendance
 * @access  Private (Trainer)
 */
exports.saveAttendance = async (req, res) => {
  try {
    const trainerId = req.user._id || req.user.id;
    const { sessionId, groupId, date, records } = req.body;

    // Validate required fields
    if (!records || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance records are required'
      });
    }

    let courseId, sessionInfo;

    // Get session/group info to extract course
    if (sessionId) {
      const session = await Session.findById(sessionId).populate('groupId', 'courseId');
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Verify trainer owns this session
      if (session.trainerId.toString() !== trainerId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this session'
        });
      }

      courseId = session.groupId.courseId;
      sessionInfo = {
        title: session.title,
        date: session.scheduledDate,
        startTime: session.startTime,
        endTime: session.endTime,
        type: session.type || 'lecture',
        location: session.location,
        notes: session.notes
      };
    } else if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      // Verify trainer owns this group
      if (group.trainerId.toString() !== trainerId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this group'
        });
      }

      courseId = group.courseId;
      sessionInfo = {
        title: `${group.name} - Attendance`,
        date: date || new Date(),
        type: 'lecture'
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either sessionId or groupId is required'
      });
    }

    // Check if attendance already exists for this session/date
    const existingAttendance = await Attendance.findOne({
      course: courseId,
      'session.date': sessionInfo.date
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.records = records.map(record => ({
        student: record.student,
        status: record.status,
        markedBy: trainerId,
        markedAt: new Date(),
        notes: record.notes,
        checkInTime: record.checkInTime || (record.status === 'present' || record.status === 'late' ? new Date() : null)
      }));

      await existingAttendance.save();

      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: existingAttendance
      });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      course: courseId,
      session: sessionInfo,
      records: records.map(record => ({
        student: record.student,
        status: record.status,
        markedBy: trainerId,
        markedAt: new Date(),
        notes: record.notes,
        checkInTime: record.checkInTime || (record.status === 'present' || record.status === 'late' ? new Date() : null)
      }))
    });

    res.status(201).json({
      success: true,
      message: 'Attendance saved successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save attendance',
      error: error.message
    });
  }
};

/**
 * @desc    Get attendance for a specific session
 * @route   GET /api/trainer/attendance/session/:sessionId
 * @access  Private (Trainer)
 */
exports.getSessionAttendance = async (req, res) => {
  try {
    const trainerId = req.user._id || req.user.id;
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId).populate('groupId', 'courseId');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify trainer owns this session
    if (session.trainerId.toString() !== trainerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this session'
      });
    }

    const attendance = await Attendance.findOne({
      course: session.groupId.courseId,
      'session.date': session.scheduledDate
    }).populate('records.student', 'name email');

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
};

/**
 * @desc    Get all attendance records for trainer's groups
 * @route   GET /api/trainer/attendance
 * @access  Private (Trainer)
 */
exports.getTrainerAttendance = async (req, res) => {
  try {
    const trainerId = req.user._id || req.user.id;

    // Get all groups for this trainer
    const groups = await Group.find({ trainerId }).distinct('courseId');

    // Get attendance for all courses
    const attendance = await Attendance.find({
      course: { $in: groups }
    })
      .populate('course', 'title')
      .populate('records.student', 'name email')
      .sort({ 'session.date': -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
};
