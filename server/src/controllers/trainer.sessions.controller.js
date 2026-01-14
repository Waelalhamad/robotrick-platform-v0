const Session = require('../models/Session');
const Group = require('../models/Group');
const SessionEvaluation = require('../models/SessionEvaluation');
const Attendance = require('../models/Attendance');

exports.getAllSessions = async (req, res) => {
  try {
    const trainerId = req.user._id || req.user.id;
    const { groupId, status, startDate, endDate, search } = req.query;

    // Build query
    const query = { trainerId };

    // Apply filters
    if (groupId) {
      query.groupId = groupId;
    }

    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) {
        query.scheduledDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.scheduledDate.$lte = new Date(endDate);
      }
    }

    // Execute query with population
    let sessions = await Session.find(query)
      .populate('groupId', 'name students color')
      .populate('courseId', 'title category')
      .sort({ scheduledDate: 1, startTime: 1 });

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      sessions = sessions.filter(session =>
        session.title.toLowerCase().includes(searchLower) ||
        session.description?.toLowerCase().includes(searchLower)
      );
    }

    // Update status automatically based on time for each session
    const sessionsWithAutoStatus = sessions.map(session => {
      const sessionObj = session.toObject({ virtuals: true });
      sessionObj.status = session.getAutoStatus();
      return sessionObj;
    });

    res.status(200).json({
      success: true,
      count: sessionsWithAutoStatus.length,
      data: sessionsWithAutoStatus
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const trainerId = req.user._id || req.user.id;

    const session = await Session.findOne({ _id: sessionId, trainerId })
      .populate('groupId', 'name students maxStudents color')
      .populate('courseId', 'title category level')
      .populate('evaluationId');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Get attendance info if exists (only if courseId is populated)
    let attendance = null;
    if (session.courseId && session.courseId._id) {
      attendance = await Attendance.findOne({
        course: session.courseId._id,
        'session.date': session.scheduledDate
      });
    }

    // Build enriched session data with automatic status
    const sessionData = {
      ...session.toObject({ virtuals: true }),
      status: session.getAutoStatus(), // Auto-update status based on time
      hasAttendance: !!attendance,
      attendanceId: attendance?._id || null,
      hasEvaluation: !!session.evaluationId,
      studentsCount: session.groupId?.students?.length || 0
    };

    res.status(200).json({
      success: true,
      data: sessionData
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session details',
      error: error.message
    });
  }
};

exports.createSession = async (req, res) => {
  try {
    const trainerId = req.user._id || req.user.id;

    const {
      title,
      description,
      groupId,
      lessonPlan
    } = req.body;

    // Validate required fields - only title and groupId
    if (!title || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Title and groupId are required'
      });
    }

    // Verify group exists and belongs to trainer
    const group = await Group.findOne({ _id: groupId, trainerId })
      .populate('courseId');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or does not belong to you'
      });
    }

    // Get existing sessions count for this group to calculate session number
    const sessionsCount = await Session.countDocuments({ groupId });
    const sessionNumber = sessionsCount + 1;

    // Auto-populate schedule from group's weekly schedule
    // Intelligently assign date based on weekly schedule and existing sessions
    let scheduledDate = null;
    let startTime = null;
    let endTime = null;
    let duration = null;

    if (group.schedule && group.schedule.length > 0) {
      // Determine which schedule day to use based on session count
      // Example: If schedule has Monday & Wednesday, session 1 = Monday, 2 = Wednesday, 3 = next Monday, etc.
      const scheduleIndex = sessionsCount % group.schedule.length;
      const selectedSchedule = group.schedule[scheduleIndex];

      startTime = selectedSchedule.startTime;
      endTime = selectedSchedule.endTime;

      // Calculate duration
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

      // Calculate which week we're in
      const weekNumber = Math.floor(sessionsCount / group.schedule.length);

      // Find the date for this schedule entry
      const today = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = daysOfWeek.indexOf(selectedSchedule.day);

      // Get the start date of the current week (Sunday)
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      // Calculate the target date
      scheduledDate = new Date(currentWeekStart);
      scheduledDate.setDate(currentWeekStart.getDate() + (weekNumber * 7) + targetDayIndex);

      // If the calculated date is in the past, move to next week
      if (scheduledDate < today) {
        scheduledDate.setDate(scheduledDate.getDate() + 7);
      }

      scheduledDate.setHours(0, 0, 0, 0); // Reset time to start of day
    }

    // Get courseId - handle both populated and unpopulated cases, or null if not assigned
    let courseId = null;
    if (group.courseId) {
      courseId = typeof group.courseId === 'object' && group.courseId._id
        ? group.courseId._id
        : group.courseId;
    }

    // Create session
    const session = await Session.create({
      title,
      description,
      groupId,
      courseId,
      trainerId,
      scheduledDate,
      startTime,
      endTime,
      duration,
      sessionNumber,
      status: 'scheduled',
      lessonPlan: lessonPlan || {}
    });

    // Update group total sessions count
    group.progress.totalSessions += 1;
    await group.save();

    // Populate before sending response
    await session.populate([
      { path: 'groupId', select: 'name students' },
      { path: 'courseId', select: 'title category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: session
    });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message
    });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const trainerId = req.user._id || req.user.id;

    const session = await Session.findOne({ _id: sessionId, trainerId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Prevent updating completed sessions
    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed sessions'
      });
    }

    // Fields that can be updated - only what trainer entered during creation
    const allowedUpdates = [
      'title',
      'description',
      'lessonPlan'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        session[field] = req.body[field];
      }
    });

    await session.save();
    await session.populate([
      { path: 'groupId', select: 'name students' },
      { path: 'courseId', select: 'title category' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: session
    });

  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session',
      error: error.message
    });
  }
};
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const trainerId = req.user._id || req.user.id;
    const { permanent, reason } = req.query;

    const session = await Session.findOne({ _id: sessionId, trainerId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (permanent === 'true') {
      // Hard delete - remove completely with cascading

      // Delete related attendance records
      await Attendance.deleteMany({ sessionId: sessionId });

      // Delete related session evaluations
      await SessionEvaluation.deleteMany({ sessionId: sessionId });

      // Delete the session itself
      await Session.findByIdAndDelete(sessionId);

      // Update group total sessions count
      const group = await Group.findById(session.groupId);
      if (group) {
        group.progress.totalSessions = Math.max(0, group.progress.totalSessions - 1);
        await group.save();
      }

      res.status(200).json({
        success: true,
        message: 'Session and all related records permanently deleted'
      });
    } else {
      // Soft delete - cancel
      session.status = 'cancelled';
      session.cancellationReason = reason || 'Cancelled by trainer';
      await session.save();

      res.status(200).json({
        success: true,
        message: 'Session cancelled successfully',
        data: session
      });
    }

  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message
    });
  }
};

exports.startSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const trainerId = req.user._id || req.user.id;

    const session = await Session.findOne({ _id: sessionId, trainerId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot start session with status: ${session.status}`
      });
    }

    // Start session using model method
    await session.startSession();

    res.status(200).json({
      success: true,
      message: 'Session started successfully',
      data: session
    });

  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message
    });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const trainerId = req.user._id || req.user.id;

    const session = await Session.findOne({ _id: sessionId, trainerId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot end session with status: ${session.status}`
      });
    }

    // End session using model method
    await session.endSession();

    res.status(200).json({
      success: true,
      message: 'Session ended successfully',
      data: session
    });

  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message
    });
  }
};

exports.getCalendarView = async (req, res) => {
  try {
    const trainerId = req.user._id || req.user.id;
    const { view = 'month', date } = req.query;

    const referenceDate = date ? new Date(date) : new Date();
    let startDate, endDate;

    // Calculate date range based on view
    switch (view) {
      case 'day':
        startDate = new Date(referenceDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(referenceDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'week':
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'month':
      default:
        startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
        endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    // Fetch sessions in date range
    const sessions = await Session.find({
      trainerId,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('groupId', 'name students color')
      .populate('courseId', 'title category')
      .sort({ scheduledDate: 1, startTime: 1 });

    // Format sessions for calendar with automatic status
    const calendarEvents = sessions.map(session => ({
      id: session._id,
      title: session.title,
      start: session.scheduledStartDateTime,
      end: session.scheduledEndDateTime,
      groupName: session.groupId?.name,
      groupColor: session.groupId?.color || '#30c59b',
      status: session.getAutoStatus(), // Auto-update status based on time
      location: session.location,
      isOnline: session.isOnline,
      studentsCount: session.groupId?.students?.length || 0,
      type: session.type
    }));

    res.status(200).json({
      success: true,
      view,
      startDate,
      endDate,
      count: calendarEvents.length,
      data: calendarEvents
    });

  } catch (error) {
    console.error('Error fetching calendar view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar view',
      error: error.message
    });
  }
};

exports.updateLessonPlan = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const trainerId = req.user._id || req.user.id;

    const session = await Session.findOne({ _id: sessionId, trainerId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update lesson plan
    session.lessonPlan = {
      ...session.lessonPlan,
      ...req.body
    };

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Lesson plan updated successfully',
      data: session
    });

  } catch (error) {
    console.error('Error updating lesson plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson plan',
      error: error.message
    });
  }
};
