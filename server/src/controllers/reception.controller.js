const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Group = require('../models/Group');
const Receipt = require('../models/Receipt');
const Lead = require('../models/Lead');

/**
 * @desc    Get reception dashboard statistics
 * @route   GET /api/reception/dashboard
 * @access  Private/Reception
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTrainers = await User.countDocuments({
      role: { $in: ['trainer', 'teacher'] }
    });
    const totalEnrollments = await Enrollment.countDocuments();

    // Get recent enrollments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEnrollments = await Enrollment.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get active groups count
    const activeGroups = await Group.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTrainers,
        totalEnrollments,
        recentEnrollments,
        activeGroups
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get all users with filters
 * @route   GET /api/reception/users
 * @access  Private/Reception
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, search, status, page = 1, limit = 20 } = req.query;

    const query = {};

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by status (active/inactive)
    if (status === 'inactive') {
      query['profile.status'] = 'inactive';
    } else if (status === 'active') {
      query['profile.status'] = { $ne: 'inactive' };
    } else {
      // By default, filter out inactive users
      query['profile.status'] = { $ne: 'inactive' };
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/reception/users
 * @access  Private/Reception
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
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
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      profile: phone ? { phone } : {}
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/reception/users/:id
 * @access  Private/Reception
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone !== undefined) {
      user.profile = { ...user.profile, phone };
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * @desc    Deactivate user (soft delete)
 * @route   DELETE /api/reception/users/:id
 * @access  Private/Reception
 */
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For now, we'll just mark in profile.
    // In future, add 'status' field to User model
    user.profile = { ...user.profile, status: 'inactive' };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
};

/**
 * @desc    Reactivate user (undo soft delete)
 * @route   PATCH /api/reception/users/:id/reactivate
 * @access  Private/Reception
 */
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove inactive status or set to active
    user.profile = { ...user.profile, status: 'active' };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating user',
      error: error.message
    });
  }
};

/**
 * @desc    Get recent enrollments (last 7 days)
 * @route   GET /api/reception/recent-enrollments
 * @access  Private/Reception
 */
const getRecentEnrollments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get enrollments from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const enrollments = await Enrollment.find({
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ enrolledAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching recent enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent enrollments',
      error: error.message
    });
  }
};

/**
 * @desc    Get recent activities (payments, status changes, leads converted)
 * @route   GET /api/reception/recent-activities
 * @access  Private/Reception
 */
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Combine and format activities
    const activities = [];

    // Get recent receipts (payments)
    try {
      const recentReceipts = await Receipt.find()
        .populate('student', 'name')
        .populate('course', 'title')
        .populate('issuedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

      // Add payment activities
      recentReceipts.forEach(receipt => {
        if (receipt.student && receipt.course && receipt.issuedBy) {
          activities.push({
            type: 'payment',
            date: receipt.createdAt,
            description: `Payment received from ${receipt.student.name}`,
            details: {
              amount: receipt.payment.amount,
              course: receipt.course.title,
              receiptNumber: receipt.receiptNumber,
              receivedBy: receipt.issuedBy.name
            }
          });
        }
      });
    } catch (err) {
      console.error('Error fetching receipts:', err);
      // Continue even if receipts fail
    }

    // Get recently converted leads
    try {
      const recentConversions = await Lead.find({ convertedToStudent: true })
        .select('fullName convertedAt')
        .sort({ convertedAt: -1 })
        .limit(parseInt(limit))
        .lean();

      // Add lead conversion activities
      recentConversions.forEach(lead => {
        if (lead.convertedAt) {
          activities.push({
            type: 'lead_converted',
            date: lead.convertedAt,
            description: `${lead.fullName} converted to student`,
            details: {
              leadName: lead.fullName
            }
          });
        }
      });
    } catch (err) {
      console.error('Error fetching lead conversions:', err);
      // Continue even if leads fail
    }

    // Get recent enrollments (not updates, just recent ones)
    try {
      const recentEnrollments = await Enrollment.find()
        .populate('student', 'name')
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

      // Add enrollment activities (only for enrollments created in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      recentEnrollments.forEach(enrollment => {
        if (enrollment.student && enrollment.course && new Date(enrollment.createdAt) > sevenDaysAgo) {
          activities.push({
            type: 'enrollment_created',
            date: enrollment.createdAt,
            description: `${enrollment.student.name} enrolled in ${enrollment.course.title}`,
            details: {
              status: enrollment.status,
              studentName: enrollment.student.name,
              courseName: enrollment.course.title
            }
          });
        }
      });
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      // Continue even if enrollments fail
    }

    // Sort all activities by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit to requested number
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  getRecentEnrollments,
  getRecentActivities
};
