/**
 * CLO Evaluation Criteria Controller
 *
 * Handles CRUD operations for evaluation criteria configuration
 * CLO can create criteria for courses or specific groups
 *
 * @controller CLOEvaluationCriteriaController
 * @version 1.0.0
 */

const EvaluationCriteria = require('../models/EvaluationCriteria');
const Course = require('../models/Course');
const Group = require('../models/Group');

/**
 * Get All Criteria (for CLO)
 * @route GET /api/clo/evaluation-criteria
 * @access Private (CLO only)
 */
exports.getAllCriteria = async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const query = { createdBy: req.user._id || req.user.id };

    if (courseId) {
      query.courseId = courseId;
    }

    if (status) {
      query.status = status;
    }

    const criteria = await EvaluationCriteria.find(query)
      .populate('courseId', 'title category')
      .populate('groupIds', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: criteria.length,
      data: criteria
    });
  } catch (error) {
    console.error('Error fetching criteria:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation criteria',
      error: error.message
    });
  }
};

/**
 * Get Single Criteria
 * @route GET /api/clo/evaluation-criteria/:id
 * @access Private (CLO only)
 */
exports.getCriteriaById = async (req, res) => {
  try {
    const { id } = req.params;

    const criteria = await EvaluationCriteria.findById(id)
      .populate('courseId', 'title category level')
      .populate('groupIds', 'name students');

    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation criteria not found'
      });
    }

    res.status(200).json({
      success: true,
      data: criteria
    });
  } catch (error) {
    console.error('Error fetching criteria:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation criteria',
      error: error.message
    });
  }
};

/**
 * Create New Criteria
 * @route POST /api/clo/evaluation-criteria
 * @access Private (CLO only)
 */
exports.createCriteria = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      name,
      description,
      appliesTo,
      courseId,
      groupIds,
      parameters,
      includeOverallRating,
      overallRatingScale,
      includeComments,
      requireComments
    } = req.body;

    // Validate required fields
    if (!name || !courseId || !appliesTo) {
      return res.status(400).json({
        success: false,
        message: 'Name, courseId, and appliesTo are required'
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

    // If appliesTo is 'groups', verify groups exist and belong to course
    if (appliesTo === 'groups') {
      if (!groupIds || groupIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one group must be specified'
        });
      }

      const groups = await Group.find({ _id: { $in: groupIds }, courseId });
      if (groups.length !== groupIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some groups not found or do not belong to the specified course'
        });
      }
    }

    // Create criteria
    const criteria = await EvaluationCriteria.create({
      name,
      description,
      appliesTo,
      courseId,
      groupIds: appliesTo === 'groups' ? groupIds : [],
      parameters: parameters || [],
      includeOverallRating: includeOverallRating !== undefined ? includeOverallRating : true,
      overallRatingScale: overallRatingScale || { min: 1, max: 5 },
      includeComments: includeComments !== undefined ? includeComments : true,
      requireComments: requireComments !== undefined ? requireComments : false,
      createdBy: userId,
      status: 'active'
    });

    await criteria.populate([
      { path: 'courseId', select: 'title category' },
      { path: 'groupIds', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Evaluation criteria created successfully',
      data: criteria
    });
  } catch (error) {
    console.error('Error creating criteria:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create evaluation criteria',
      error: error.message
    });
  }
};

/**
 * Update Criteria
 * @route PUT /api/clo/evaluation-criteria/:id
 * @access Private (CLO only)
 */
exports.updateCriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const criteria = await EvaluationCriteria.findOne({ _id: id, createdBy: userId });

    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation criteria not found'
      });
    }

    const allowedUpdates = [
      'name',
      'description',
      'appliesTo',
      'groupIds',
      'parameters',
      'includeOverallRating',
      'overallRatingScale',
      'includeComments',
      'requireComments',
      'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        criteria[field] = req.body[field];
      }
    });

    await criteria.save();
    await criteria.populate([
      { path: 'courseId', select: 'title category' },
      { path: 'groupIds', select: 'name' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Evaluation criteria updated successfully',
      data: criteria
    });
  } catch (error) {
    console.error('Error updating criteria:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update evaluation criteria',
      error: error.message
    });
  }
};

/**
 * Delete Criteria
 * @route DELETE /api/clo/evaluation-criteria/:id
 * @access Private (CLO only)
 */
exports.deleteCriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const criteria = await EvaluationCriteria.findOne({ _id: id, createdBy: userId });

    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation criteria not found'
      });
    }

    // Permanently delete the criteria
    await EvaluationCriteria.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Evaluation criteria deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting criteria:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete evaluation criteria',
      error: error.message
    });
  }
};

/**
 * Get Criteria for a Group (used by trainers)
 * @route GET /api/trainer/evaluation-criteria/group/:groupId
 * @access Private (Trainer only)
 */
exports.getCriteriaForGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).select('courseId');
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const criteria = await EvaluationCriteria.getCriteriaForGroup(groupId, group.courseId);

    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'No evaluation criteria found for this group'
      });
    }

    res.status(200).json({
      success: true,
      data: criteria
    });
  } catch (error) {
    console.error('Error fetching criteria for group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation criteria',
      error: error.message
    });
  }
};
