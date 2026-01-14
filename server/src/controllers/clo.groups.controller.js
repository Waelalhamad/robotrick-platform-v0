const Group = require('../models/Group');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const StudentEvaluation = require('../models/StudentEvaluation');

/**
 * Get all groups with statistics
 * @route GET /api/tdo/groups
 * @access TDO Admin only
 */
exports.getAllGroups = async (req, res) => {
  try {
    const { status, courseId, trainerId, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (courseId) {
      query.courseId = courseId;
    }

    if (trainerId) {
      query.trainerId = trainerId;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const groups = await Group.find(query)
      .populate({
        path: 'courseId',
        select: 'title category level',
        options: { strictPopulate: false } // Don't fail if reference is missing
      })
      .populate({
        path: 'trainerId',
        select: 'name email profile',
        options: { strictPopulate: false } // Don't fail if reference is missing
      })
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .lean();

    // Debug: Log first group to check population
    if (groups.length > 0) {
      console.log('Sample group after populate:', JSON.stringify(groups[0], null, 2));
    }

    const groupsWithStats = await Promise.all(
      groups.map(async (group) => {
          const enrollments = await Enrollment.countDocuments({
            groupId: group._id
          });

          const attendanceStats = await Attendance.aggregate([
            {
              $match: { group: group._id }
            },
            {
              $unwind: '$records'
            },
            {
              $group: {
                _id: null,
                totalRecords: { $sum: 1 },
                presentCount: {
                  $sum: {
                    $cond: [
                      { $in: ['$records.status', ['present', 'late']] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]);

          const avgAttendance = attendanceStats.length > 0
            ? ((attendanceStats[0].presentCount / attendanceStats[0].totalRecords) * 100).toFixed(1)
            : 0;

          return {
            ...group,
            stats: {
              studentsCount: group.students?.length || 0,
              enrollments,
              avgAttendance: parseFloat(avgAttendance)
            }
          };
        })
    );

    res.status(200).json({
      success: true,
      data: groupsWithStats
    });

  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups',
      error: error.message
    });
  }
};

/**
 * Get group details with full information
 * @route GET /api/tdo/groups/:id
 * @access TDO Admin only
 */
exports.getGroupDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get group
    const group = await Group.findById(id)
      .populate('courseId', 'title category level duration')
      .populate('trainerId', 'name email profile')
      .populate('students', 'name email profile')
      .lean();

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Get enrollments
    const enrollments = await Enrollment.find({ groupId: id })
      .populate('studentId', 'name email')
      .select('studentId status enrollmentDate progress');

    // Get attendance records
    const attendanceRecords = await Attendance.find({ group: id })
      .sort({ 'session.date': -1 })
      .limit(10);

    // Calculate statistics
    const attendanceStats = await Attendance.aggregate([
      {
        $match: { group: group._id }
      },
      {
        $unwind: '$records'
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentCount: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0]
            }
          },
          lateCount: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'late'] }, 1, 0]
            }
          },
          absentCount: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = attendanceStats.length > 0 ? attendanceStats[0] : {
      totalRecords: 0,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0
    };

    const avgAttendance = stats.totalRecords > 0
      ? (((stats.presentCount + stats.lateCount) / stats.totalRecords) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...group,
        enrollments,
        recentAttendance: attendanceRecords,
        stats: {
          studentsCount: group.students?.length || 0,
          enrollmentsCount: enrollments.length,
          avgAttendance: parseFloat(avgAttendance),
          attendanceBreakdown: {
            present: stats.presentCount,
            late: stats.lateCount,
            absent: stats.absentCount,
            total: stats.totalRecords
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group details',
      error: error.message
    });
  }
};

/**
 * Create a new group
 * @route POST /api/tdo/groups
 * @access TDO Admin only
 */
exports.createGroup = async (req, res) => {
  try {
    const {
      name,
      courseId,
      trainerId,
      startDate,
      endDate,
      schedule,
      maxStudents,
      description
    } = req.body;

    if (!name || !courseId || !trainerId) {
      return res.status(400).json({
        success: false,
        message: 'Name, course, and trainer are required'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify trainer exists
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Create group
    const group = await Group.create({
      name,
      courseId,
      trainerId,
      startDate,
      endDate,
      schedule: schedule || [],
      maxStudents: maxStudents || 30,
      description,
      status: 'active',
      students: []
    });

    // Populate references
    await group.populate({
      path: 'courseId',
      select: 'title category level'
    });
    await group.populate({
      path: 'trainerId',
      select: 'name email profile'
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });

  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group',
      error: error.message
    });
  }
};

/**
 * Update group information
 * @route PUT /api/tdo/groups/:id
 * @access TDO Admin only
 */
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // If courseId is being updated, verify it exists
    if (updateData.courseId) {
      const course = await Course.findById(updateData.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
    }

    // If trainerId is being updated, verify they exist
    if (updateData.trainerId) {
      const trainer = await User.findById(updateData.trainerId);
      if (!trainer || trainer.role !== 'trainer') {
        return res.status(404).json({
          success: false,
          message: 'Trainer not found'
        });
      }
    }

    // Update group
    Object.keys(updateData).forEach(key => {
      if (key !== 'students') { // Prevent direct students array manipulation
        group[key] = updateData[key];
      }
    });

    await group.save();
    await group.populate({
      path: 'courseId',
      select: 'title category level'
    });
    await group.populate({
      path: 'trainerId',
      select: 'name email profile'
    });

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: group
    });

  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group',
      error: error.message
    });
  }
};

/**
 * Delete a group permanently
 * @route DELETE /api/clo/groups/:id
 * @access CLO Admin only
 */
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Cascade delete all related data

    // Delete all enrollments for this group
    await Enrollment.deleteMany({ groupId: id });

    // Delete all sessions for this group
    await Session.deleteMany({ groupId: id });

    // Delete all student evaluations for this group
    await StudentEvaluation.deleteMany({ groupId: id });

    // Delete all attendance records for this group
    await Attendance.deleteMany({ groupId: id });

    // Finally, delete the group itself
    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Group and all related data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete group',
      error: error.message
    });
  }
};

/**
 * Close/reopen a group
 * @route PUT /api/clo/groups/:id/status
 * @access CLO Admin only
 */
exports.closeGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'close' } = req.body;

    // Check if group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Update group status
    group.status = action === 'close' ? 'completed' : 'active';
    await group.save();

    res.status(200).json({
      success: true,
      message: `Group ${action === 'close' ? 'closed' : 'reopened'} successfully`,
      data: {
        _id: group._id,
        name: group.name,
        status: group.status
      }
    });

  } catch (error) {
    console.error('Error closing group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group status',
      error: error.message
    });
  }
};

/**
 * Assign/reassign trainer to group
 * @route POST /api/tdo/groups/:id/assign-trainer
 * @access TDO Admin only
 */
exports.assignTrainerToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { trainerId } = req.body;

    // Validate
    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: 'Trainer ID is required'
      });
    }

    // Check if group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Verify trainer exists
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Update trainer
    group.trainerId = trainerId;
    await group.save();
    await group.populate('trainerId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Trainer assigned to group successfully',
      data: group
    });

  } catch (error) {
    console.error('Error assigning trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign trainer',
      error: error.message
    });
  }
};

/**
 * Get group students
 * @route GET /api/tdo/groups/:id/students
 * @access TDO Admin only
 */
exports.getGroupStudents = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const group = await Group.findById(id).populate('students', 'name email profile');
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Get enrollments for these students
    const enrollments = await Enrollment.find({
      groupId: id
    }).populate('studentId', 'name email');

    // Get attendance for each student
    const studentsWithStats = await Promise.all(
      (group.students || []).map(async (student) => {
        // Get attendance records
        const attendanceRecords = await Attendance.aggregate([
          {
            $match: { group: group._id }
          },
          {
            $unwind: '$records'
          },
          {
            $match: {
              'records.student': student._id
            }
          },
          {
            $group: {
              _id: null,
              totalSessions: { $sum: 1 },
              presentCount: {
                $sum: {
                  $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0]
                }
              },
              lateCount: {
                $sum: {
                  $cond: [{ $eq: ['$records.status', 'late'] }, 1, 0]
                }
              },
              absentCount: {
                $sum: {
                  $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0]
                }
              }
            }
          }
        ]);

        const attendance = attendanceRecords.length > 0 ? attendanceRecords[0] : {
          totalSessions: 0,
          presentCount: 0,
          lateCount: 0,
          absentCount: 0
        };

        const attendanceRate = attendance.totalSessions > 0
          ? (((attendance.presentCount + attendance.lateCount) / attendance.totalSessions) * 100).toFixed(1)
          : 0;

        // Get enrollment info
        const enrollment = enrollments.find(e => e.studentId._id.toString() === student._id.toString());

        return {
          ...student.toObject(),
          attendance: {
            rate: parseFloat(attendanceRate),
            present: attendance.presentCount,
            late: attendance.lateCount,
            absent: attendance.absentCount,
            total: attendance.totalSessions
          },
          enrollment: enrollment ? {
            status: enrollment.status,
            progress: enrollment.progress,
            enrollmentDate: enrollment.enrollmentDate
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: studentsWithStats
    });

  } catch (error) {
    console.error('Error fetching group students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group students',
      error: error.message
    });
  }
};

/**
 * Add student to group
 * @route POST /api/tdo/groups/:id/students
 * @access TDO Admin only
 */
exports.addStudentToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    // Validate
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Check if group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check capacity
    if (group.maxCapacity && group.students.length >= group.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Group has reached maximum capacity'
      });
    }

    // Check if student already in group
    if (group.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already in this group'
      });
    }

    // Add student to group
    group.students.push(studentId);
    await group.save();

    // Create enrollment if doesn't exist
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId: group.courseId,
      groupId: id
    });

    if (!existingEnrollment) {
      await Enrollment.create({
        studentId,
        courseId: group.courseId,
        groupId: id,
        status: 'active',
        enrollmentDate: new Date(),
        progress: 0
      });
    }

    await group.populate('students', 'name email');

    res.status(200).json({
      success: true,
      message: 'Student added to group successfully',
      data: group
    });

  } catch (error) {
    console.error('Error adding student to group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add student to group',
      error: error.message
    });
  }
};

/**
 * Remove student from group
 * @route DELETE /api/tdo/groups/:id/students/:studentId
 * @access TDO Admin only
 */
exports.removeStudentFromGroup = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    // Check if group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if student is in group
    if (!group.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is not in this group'
      });
    }

    // Remove student from group
    group.students = group.students.filter(s => s.toString() !== studentId);
    await group.save();

    // Update enrollment status
    await Enrollment.updateOne(
      {
        studentId,
        groupId: id
      },
      {
        status: 'dropped',
        droppedDate: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Student removed from group successfully'
    });

  } catch (error) {
    console.error('Error removing student from group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove student from group',
      error: error.message
    });
  }
};
