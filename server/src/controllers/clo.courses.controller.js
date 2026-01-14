const Course = require('../models/Course');
const Group = require('../models/Group');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

/**
 * Get all courses with statistics
 * @route GET /api/tdo/courses
 * @access TDO Admin only
 */
exports.getAllCourses = async (req, res) => {
  try {
    const { status, category, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get courses
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    // Get statistics for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Get groups count
        const totalGroups = await Group.countDocuments({ courseId: course._id });
        const activeGroups = await Group.countDocuments({
          courseId: course._id,
          status: 'active'
        });

        // Get enrollments count
        const totalEnrollments = await Enrollment.countDocuments({ courseId: course._id });
        const activeEnrollments = await Enrollment.countDocuments({
          courseId: course._id,
          status: 'active'
        });
        const completedEnrollments = await Enrollment.countDocuments({
          courseId: course._id,
          status: 'completed'
        });

        // Calculate completion rate
        const completionRate = totalEnrollments > 0
          ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
          : 0;

        // Get unique trainers teaching this course
        const trainersCount = await Group.distinct('trainerId', { courseId: course._id });

        return {
          ...course.toObject(),
          stats: {
            totalGroups,
            activeGroups,
            totalEnrollments,
            activeEnrollments,
            completedEnrollments,
            completionRate: parseFloat(completionRate),
            trainersCount: trainersCount.length
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: coursesWithStats
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

/**
 * Get course details with full statistics
 * @route GET /api/tdo/courses/:id
 * @access TDO Admin only
 */
exports.getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get course
    const course = await Course.findById(id)
      .populate('instructor', 'name email profile');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get groups with trainers
    const groups = await Group.find({ courseId: id })
      .populate('trainerId', 'name email')
      .select('name trainerId students status startDate endDate schedule');

    // Get enrollments
    const enrollments = await Enrollment.find({ courseId: id })
      .populate('studentId', 'name email')
      .select('studentId status enrollmentDate completionDate progress');

    // Get trainers teaching this course
    const trainerIds = await Group.distinct('trainerId', { courseId: id });
    const trainers = await User.find({
      _id: { $in: trainerIds },
      role: 'trainer'
    }).select('name email profile');

    // Calculate statistics
    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
    const completionRate = totalEnrollments > 0
      ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
      : 0;

    const avgProgress = totalEnrollments > 0
      ? (enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        course: course.toObject(),
        groups,
        trainers,
        enrollments,
        stats: {
          totalGroups: groups.length,
          activeGroups: groups.filter(g => g.status === 'active').length,
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          completionRate: parseFloat(completionRate),
          avgProgress: parseFloat(avgProgress),
          trainersCount: trainers.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details',
      error: error.message
    });
  }
};

/**
 * Create a new course
 * @route POST /api/tdo/courses
 * @access TDO Admin only
 */
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      duration,
      price,
      instructor,
      thumbnail,
      syllabus,
      objectives,
      prerequisites
    } = req.body;

    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }

    // If instructor provided, verify they exist
    if (instructor) {
      const instructorUser = await User.findById(instructor);
      if (!instructorUser || (instructorUser.role !== 'trainer' && instructorUser.role !== 'admin')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid instructor'
        });
      }
    }

    // Create course
    const course = await Course.create({
      title,
      description,
      category,
      level: level || 'beginner',
      duration: duration || 0,
      price: price || 0,
      instructor,
      thumbnail,
      syllabus: syllabus || [],
      objectives: objectives || [],
      prerequisites: prerequisites || [],
      status: 'draft'
    });

    // Populate instructor
    await course.populate('instructor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });

  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

/**
 * Update course information
 * @route PUT /api/tdo/courses/:id
 * @access TDO Admin only
 */
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If instructor is being updated, verify they exist
    if (updateData.instructor) {
      const instructorUser = await User.findById(updateData.instructor);
      if (!instructorUser || (instructorUser.role !== 'trainer' && instructorUser.role !== 'admin')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid instructor'
        });
      }
    }

    // Update course
    Object.keys(updateData).forEach(key => {
      course[key] = updateData[key];
    });

    await course.save();
    await course.populate('instructor', 'name email');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

/**
 * Delete a course permanently
 * @route DELETE /api/clo/courses/:id
 * @access CLO Admin only
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Only allow deletion of draft courses
    if (course.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft courses can be deleted. Please archive published courses instead.'
      });
    }

    // Check if course has any groups
    const groupsCount = await Group.countDocuments({ courseId: id });
    if (groupsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with existing groups. Please remove all groups first.'
      });
    }

    // Check if course has any enrollments
    const enrollmentsCount = await Enrollment.countDocuments({ courseId: id });
    if (enrollmentsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with existing enrollments.'
      });
    }

    // Delete the course
    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

/**
 * Archive/unarchive a course
 * @route PUT /api/clo/courses/:id/archive
 * @access CLO Admin only
 */
exports.archiveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'archive' } = req.body;

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has active groups
    const activeGroups = await Group.countDocuments({
      courseId: id,
      status: 'active'
    });

    if (action === 'archive' && activeGroups > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot archive course with active groups. Please complete or close all active groups first.'
      });
    }

    // Update course status
    course.status = action === 'archive' ? 'archived' : 'published';
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${action === 'archive' ? 'archived' : 'unarchived'} successfully`,
      data: {
        _id: course._id,
        title: course.title,
        status: course.status
      }
    });

  } catch (error) {
    console.error('Error archiving course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course status',
      error: error.message
    });
  }
};

/**
 * Get course statistics and analytics
 * @route GET /api/tdo/courses/:id/statistics
 * @access TDO Admin only
 */
exports.getCourseStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query; // days

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Enrollment trends
    const enrollmentTrends = await Enrollment.aggregate([
      {
        $match: {
          courseId: course._id,
          enrollmentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$enrollmentDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Completion trends
    const completionTrends = await Enrollment.aggregate([
      {
        $match: {
          courseId: course._id,
          status: 'completed',
          completionDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completionDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Progress distribution
    const progressDistribution = await Enrollment.aggregate([
      {
        $match: { courseId: course._id }
      },
      {
        $bucket: {
          groupBy: '$progress',
          boundaries: [0, 25, 50, 75, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            students: { $push: '$studentId' }
          }
        }
      }
    ]);

    // Group performance
    const groupPerformance = await Group.aggregate([
      {
        $match: { courseId: course._id }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'trainerId',
          foreignField: '_id',
          as: 'trainer'
        }
      },
      {
        $unwind: '$trainer'
      },
      {
        $project: {
          _id: 1,
          name: 1,
          trainerName: '$trainer.name',
          studentsCount: { $size: { $ifNull: ['$students', []] } },
          status: 1,
          startDate: 1,
          endDate: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          category: course.category
        },
        period: daysAgo,
        enrollmentTrends,
        completionTrends,
        progressDistribution,
        groupPerformance
      }
    });

  } catch (error) {
    console.error('Error fetching course statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course statistics',
      error: error.message
    });
  }
};
