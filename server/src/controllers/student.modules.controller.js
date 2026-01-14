const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const Module = require('../models/Module');
const ModuleProgress = require('../models/ModuleProgress');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Get module content
// @route   GET /api/student/modules/:moduleId
// @access  Private (Student)
exports.getModuleContent = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const studentId = req.user._id;

  const module = await Module.findById(moduleId)
    .populate('quiz', 'title description passingScore timeLimit maxAttempts')
    .populate('assignment', 'title description dueDate maxScore allowedFileTypes');

  if (!module) {
    throw new AppError('Module not found', 404);
  }

  // Check if student is enrolled in the course
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: module.course,
    status: { $in: ['active', 'completed'] }
  });

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  // Check if module is locked
  if (module.isLocked && module.unlockAfter) {
    const previousModuleProgress = await ModuleProgress.findOne({
      student: studentId,
      module: module.unlockAfter,
      status: 'completed'
    });

    if (!previousModuleProgress) {
      throw new AppError('This module is locked. Complete the previous module first.', 403);
    }
  }

  // Get or create progress for this module
  let progress = await ModuleProgress.getOrCreate(studentId, moduleId, module.course);

  // Update last accessed
  progress.lastAccessedAt = new Date();
  await progress.save();

  logger.info('Module content accessed', {
    studentId,
    moduleId,
    moduleTitle: module.title
  });

  res.json({
    success: true,
    data: {
      module,
      progress
    }
  });
});

// @desc    Start a module
// @route   POST /api/student/modules/:moduleId/start
// @access  Private (Student)
exports.startModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const studentId = req.user._id;

  const module = await Module.findById(moduleId);
  if (!module) {
    throw new AppError('Module not found', 404);
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: module.course,
    status: 'active'
  });

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  // Get or create progress
  let progress = await ModuleProgress.getOrCreate(studentId, moduleId, module.course);

  // Mark as started
  if (progress.status === 'not_started') {
    progress.markAsStarted();
    await progress.save();

    // Update enrollment current module
    enrollment.progress.currentModule = moduleId;
    enrollment.progress.lastAccessedAt = new Date();
    await enrollment.save();

    logger.info('Module started', {
      studentId,
      moduleId,
      moduleTitle: module.title
    });
  }

  res.json({
    success: true,
    message: 'Module started successfully',
    data: progress
  });
});

// @desc    Mark module as completed
// @route   POST /api/student/modules/:moduleId/complete
// @access  Private (Student)
exports.completeModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const studentId = req.user._id;

  const module = await Module.findById(moduleId);
  if (!module) {
    throw new AppError('Module not found', 404);
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: module.course,
    status: 'active'
  });

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  // Get progress
  let progress = await ModuleProgress.findOne({
    student: studentId,
    module: moduleId,
    course: module.course
  });

  if (!progress) {
    throw new AppError('Module progress not found. Start the module first.', 400);
  }

  // Mark as completed
  if (progress.status !== 'completed') {
    progress.markAsCompleted();
    await progress.save();

    // Update enrollment progress
    if (!enrollment.progress.completedModules.includes(moduleId)) {
      enrollment.progress.completedModules.push(moduleId);

      // Get total modules count
      const totalModules = await Module.countDocuments({
        course: module.course,
        isActive: true
      });

      // Update progress percentage
      await enrollment.updateProgressPercentage(totalModules);

      // Check if course is completed
      if (enrollment.progress.percentageComplete >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }

      await enrollment.save();
    }

    logger.info('Module completed', {
      studentId,
      moduleId,
      moduleTitle: module.title,
      progressPercentage: enrollment.progress.percentageComplete
    });
  }

  res.json({
    success: true,
    message: 'Module marked as completed',
    data: {
      progress,
      enrollment: {
        percentageComplete: enrollment.progress.percentageComplete,
        completedModules: enrollment.progress.completedModules.length
      }
    }
  });
});

// @desc    Update module progress (time spent, video progress)
// @route   PATCH /api/student/modules/:moduleId/progress
// @access  Private (Student)
exports.updateModuleProgress = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const studentId = req.user._id;
  const { timeSpent, videoProgress } = req.body;

  const module = await Module.findById(moduleId);
  if (!module) {
    throw new AppError('Module not found', 404);
  }

  // Get progress
  let progress = await ModuleProgress.getOrCreate(studentId, moduleId, module.course);

  // Update time spent
  if (timeSpent !== undefined) {
    progress.addTimeSpent(timeSpent);
  }

  // Update video progress
  if (videoProgress) {
    progress.videoProgress = {
      currentTime: videoProgress.currentTime || 0,
      duration: videoProgress.duration || 0,
      completed: videoProgress.completed || false
    };
  }

  await progress.save();

  res.json({
    success: true,
    message: 'Progress updated',
    data: progress
  });
});

// @desc    Get module progress
// @route   GET /api/student/modules/:moduleId/progress
// @access  Private (Student)
exports.getModuleProgress = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const studentId = req.user._id;

  const module = await Module.findById(moduleId);
  if (!module) {
    throw new AppError('Module not found', 404);
  }

  const progress = await ModuleProgress.findOne({
    student: studentId,
    module: moduleId
  });

  res.json({
    success: true,
    data: progress || {
      status: 'not_started',
      timeSpent: 0,
      videoProgress: {
        currentTime: 0,
        duration: 0,
        completed: false
      }
    }
  });
});

// @desc    Get next module
// @route   GET /api/student/modules/:moduleId/next
// @access  Private (Student)
exports.getNextModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const studentId = req.user._id;

  const currentModule = await Module.findById(moduleId);
  if (!currentModule) {
    throw new AppError('Module not found', 404);
  }

  // Get next module
  const nextModule = await Module.getNextModule(currentModule.course, currentModule.order);

  if (!nextModule) {
    return res.json({
      success: true,
      message: 'No next module. You have reached the end of the course.',
      data: null
    });
  }

  res.json({
    success: true,
    data: nextModule
  });
});

// @desc    Get previous module
// @route   GET /api/student/modules/:moduleId/previous
// @access  Private (Student)
exports.getPreviousModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const studentId = req.user._id;

  const currentModule = await Module.findById(moduleId);
  if (!currentModule) {
    throw new AppError('Module not found', 404);
  }

  // Get previous module
  const previousModule = await Module.getPreviousModule(currentModule.course, currentModule.order);

  if (!previousModule) {
    return res.json({
      success: true,
      message: 'No previous module. This is the first module.',
      data: null
    });
  }

  res.json({
    success: true,
    data: previousModule
  });
});

module.exports = exports;
