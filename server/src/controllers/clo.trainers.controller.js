const User = require('../models/User');
const Course = require('../models/Course');
const Group = require('../models/Group');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');

/**
 * Get all trainers with their statistics
 * @route GET /api/tdo/trainers
 * @access TDO Admin only
 */
exports.getAllTrainers = async (req, res) => {
  try {
    const { status, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query
    const query = { role: 'trainer' };

    if (status) {
      if (status === 'active') {
        query['profile.isActive'] = { $ne: false };
      } else if (status === 'inactive') {
        query['profile.isActive'] = false;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get trainers
    const trainers = await User.find(query)
      .select('-passwordHash')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    // Get statistics for each trainer
    const trainersWithStats = await Promise.all(
      trainers.map(async (trainer) => {
        // Get groups count
        const totalGroups = await Group.countDocuments({ trainerId: trainer._id });
        const activeGroups = await Group.countDocuments({
          trainerId: trainer._id,
          status: 'active'
        });

        // Get total students across all groups
        const groups = await Group.find({ trainerId: trainer._id });
        const totalStudents = groups.reduce((sum, group) => sum + (group.students?.length || 0), 0);

        // Get courses assigned to
        const coursesAssigned = await Group.distinct('courseId', { trainerId: trainer._id });

        // Get average attendance rate
        const attendanceStats = await Attendance.aggregate([
          {
            $lookup: {
              from: 'groups',
              localField: 'group',
              foreignField: '_id',
              as: 'groupData'
            }
          },
          {
            $unwind: '$groupData'
          },
          {
            $match: {
              'groupData.trainerId': trainer._id
            }
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
          ...trainer.toObject(),
          stats: {
            totalGroups,
            activeGroups,
            totalStudents,
            coursesCount: coursesAssigned.length,
            avgAttendance: parseFloat(avgAttendance)
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: trainersWithStats
    });

  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainers',
      error: error.message
    });
  }
};

/**
 * Create a new trainer
 * @route POST /api/tdo/trainers
 * @access TDO Admin only
 */
exports.createTrainer = async (req, res) => {
  try {
    const { name, email, password, profile } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create trainer
    const trainer = await User.create({
      name,
      email,
      passwordHash,
      role: 'trainer',
      profile: {
        ...profile,
        isActive: true,
        specialization: profile?.specialization || '',
        bio: profile?.bio || '',
        phone: profile?.phone || ''
      }
    });

    // Remove password hash from response
    const trainerObj = trainer.toObject();
    delete trainerObj.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: trainerObj
    });

  } catch (error) {
    console.error('Error creating trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trainer',
      error: error.message
    });
  }
};

/**
 * Update trainer information
 * @route PUT /api/tdo/trainers/:id
 * @access TDO Admin only
 */
exports.updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, profile, password } = req.body;

    // Check if trainer exists
    const trainer = await User.findById(id);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Update fields
    if (name) trainer.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      trainer.email = email;
    }

    if (profile) {
      trainer.profile = {
        ...trainer.profile,
        ...profile
      };
    }

    // Update password if provided
    if (password) {
      trainer.passwordHash = await bcrypt.hash(password, 10);
    }

    await trainer.save();

    // Remove password hash from response
    const trainerObj = trainer.toObject();
    delete trainerObj.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Trainer updated successfully',
      data: trainerObj
    });

  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trainer',
      error: error.message
    });
  }
};

/**
 * Deactivate/reactivate trainer
 * @route DELETE /api/tdo/trainers/:id
 * @access TDO Admin only
 */
exports.deactivateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'deactivate' } = req.body;

    // Check if trainer exists
    const trainer = await User.findById(id);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Update active status
    trainer.profile = {
      ...trainer.profile,
      isActive: action === 'activate'
    };

    await trainer.save();

    res.status(200).json({
      success: true,
      message: `Trainer ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        isActive: trainer.profile.isActive
      }
    });

  } catch (error) {
    console.error('Error deactivating trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trainer status',
      error: error.message
    });
  }
};

/**
 * Get trainer performance metrics
 * @route GET /api/tdo/trainers/:id/performance
 * @access TDO Admin only
 */
exports.getTrainerPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query; // days

    // Check if trainer exists
    const trainer = await User.findById(id);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get all groups
    const groups = await Group.find({ trainerId: id })
      .populate('courseId', 'title category')
      .select('name courseId students status startDate endDate');

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
      {
        $lookup: {
          from: 'groups',
          localField: 'group',
          foreignField: '_id',
          as: 'groupData'
        }
      },
      {
        $unwind: '$groupData'
      },
      {
        $match: {
          'groupData.trainerId': trainer._id,
          'session.date': { $gte: startDate }
        }
      },
      {
        $unwind: '$records'
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$session.date' }
          },
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
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate overall attendance rate
    const totalAttendance = attendanceStats.reduce((sum, day) => sum + day.totalRecords, 0);
    const totalPresent = attendanceStats.reduce((sum, day) => sum + day.presentCount + day.lateCount, 0);
    const overallAttendanceRate = totalAttendance > 0
      ? ((totalPresent / totalAttendance) * 100).toFixed(1)
      : 0;

    // Get courses taught
    const coursesTaught = await Group.distinct('courseId', { trainerId: id });
    const courses = await Course.find({ _id: { $in: coursesTaught } })
      .select('title category');

    // Get total students
    const totalStudents = groups.reduce((sum, group) => sum + (group.students?.length || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        trainer: {
          _id: trainer._id,
          name: trainer.name,
          email: trainer.email,
          profile: trainer.profile
        },
        performance: {
          period: daysAgo,
          totalGroups: groups.length,
          activeGroups: groups.filter(g => g.status === 'active').length,
          totalStudents,
          coursesCount: courses.length,
          overallAttendanceRate: parseFloat(overallAttendanceRate)
        },
        groups,
        courses,
        attendanceTrends: attendanceStats
      }
    });

  } catch (error) {
    console.error('Error fetching trainer performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainer performance',
      error: error.message
    });
  }
};

/**
 * Assign trainer to a course
 * @route POST /api/tdo/trainers/:id/assign-course
 * @access TDO Admin only
 */
exports.assignTrainerToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId } = req.body;

    // Validate
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Check if trainer exists
    const trainer = await User.findById(id);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
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

    // Add trainer to course's authorized trainers list
    if (!trainer.profile) {
      trainer.profile = {};
    }
    if (!trainer.profile.authorizedCourses) {
      trainer.profile.authorizedCourses = [];
    }

    if (!trainer.profile.authorizedCourses.includes(courseId)) {
      trainer.profile.authorizedCourses.push(courseId);
      await trainer.save();
    }

    res.status(200).json({
      success: true,
      message: 'Trainer assigned to course successfully',
      data: {
        trainerId: trainer._id,
        trainerName: trainer.name,
        courseId: course._id,
        courseTitle: course.title
      }
    });

  } catch (error) {
    console.error('Error assigning trainer to course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign trainer to course',
      error: error.message
    });
  }
};

/**
 * Remove trainer from a course
 * @route DELETE /api/tdo/trainers/:trainerId/courses/:courseId
 * @access TDO Admin only
 */
exports.removeTrainerFromCourse = async (req, res) => {
  try {
    const { trainerId, courseId } = req.params;

    // Check if trainer exists
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Remove course from authorized courses
    if (trainer.profile?.authorizedCourses) {
      trainer.profile.authorizedCourses = trainer.profile.authorizedCourses.filter(
        cId => cId.toString() !== courseId
      );
      await trainer.save();
    }

    res.status(200).json({
      success: true,
      message: 'Trainer removed from course successfully'
    });

  } catch (error) {
    console.error('Error removing trainer from course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove trainer from course',
      error: error.message
    });
  }
};
