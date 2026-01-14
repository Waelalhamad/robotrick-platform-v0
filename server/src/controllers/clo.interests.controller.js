const Interest = require('../models/Interest');

/**
 * Get all interests with optional filters
 */
exports.getAllInterests = async (req, res) => {
  try {
    const { status, search } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const interests = await Interest.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      interests,
      total: interests.length,
    });
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({
      message: 'Failed to fetch interests',
      error: error.message,
    });
  }
};

/**
 * Get interest by ID
 */
exports.getInterestById = async (req, res) => {
  try {
    const interest = await Interest.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    res.json({ interest });
  } catch (error) {
    console.error('Error fetching interest:', error);
    res.status(500).json({
      message: 'Failed to fetch interest',
      error: error.message,
    });
  }
};

/**
 * Create new interest
 */
exports.createInterest = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Interest name is required' });
    }

    // Check if interest already exists
    const existingInterest = await Interest.findOne({ name });
    if (existingInterest) {
      return res.status(400).json({ message: 'Interest with this name already exists' });
    }

    // Create interest
    const interest = new Interest({
      name,
      description,
      createdBy: req.user.id,
    });

    await interest.save();

    res.status(201).json({
      message: 'Interest created successfully',
      interest,
    });
  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({
      message: 'Failed to create interest',
      error: error.message,
    });
  }
};

/**
 * Update interest
 */
exports.updateInterest = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const interest = await Interest.findById(req.params.id);
    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== interest.name) {
      const existingInterest = await Interest.findOne({ name });
      if (existingInterest) {
        return res.status(400).json({ message: 'Interest with this name already exists' });
      }
      interest.name = name;
    }

    if (description !== undefined) interest.description = description;
    if (status) interest.status = status;

    await interest.save();

    res.json({
      message: 'Interest updated successfully',
      interest,
    });
  } catch (error) {
    console.error('Error updating interest:', error);
    res.status(500).json({
      message: 'Failed to update interest',
      error: error.message,
    });
  }
};

/**
 * Archive interest
 */
exports.archiveInterest = async (req, res) => {
  try {
    const interest = await Interest.findById(req.params.id);
    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    interest.status = 'archived';
    await interest.save();

    res.json({
      message: 'Interest archived successfully',
      interest,
    });
  } catch (error) {
    console.error('Error archiving interest:', error);
    res.status(500).json({
      message: 'Failed to archive interest',
      error: error.message,
    });
  }
};

/**
 * Delete interest
 */
exports.deleteInterest = async (req, res) => {
  try {
    const interest = await Interest.findById(req.params.id);
    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    await Interest.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Interest deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting interest:', error);
    res.status(500).json({
      message: 'Failed to delete interest',
      error: error.message,
    });
  }
};
