const express = require('express');
const router = express.Router();
const { protect, requireCLO } = require('../middleware/auth');

// Import controllers
const {
  getDashboardStats,
  getAnalyticsOverview
} = require('../controllers/clo.dashboard.controller');

const {
  getAllTrainers,
  createTrainer,
  updateTrainer,
  deactivateTrainer,
  getTrainerPerformance,
  assignTrainerToCourse,
  removeTrainerFromCourse
} = require('../controllers/clo.trainers.controller');

const {
  getAllCourses,
  getCourseDetails,
  createCourse,
  updateCourse,
  deleteCourse,
  archiveCourse,
  getCourseStatistics
} = require('../controllers/clo.courses.controller');

const {
  getAllGroups,
  getGroupDetails,
  createGroup,
  updateGroup,
  deleteGroup,
  closeGroup,
  assignTrainerToGroup,
  getGroupStudents,
  addStudentToGroup,
  removeStudentFromGroup
} = require('../controllers/clo.groups.controller');

const {
  getAllEvaluations,
  getEvaluationById,
  getGroupEvaluations,
  getEvaluationStats
} = require('../controllers/clo.evaluations.controller');

const {
  getAllAttendance,
  getAttendanceById,
  getCourseAttendance,
  getAttendanceStats
} = require('../controllers/clo.attendance.controller');

const {
  getAllCriteria,
  getCriteriaById,
  createCriteria,
  updateCriteria,
  deleteCriteria
} = require('../controllers/clo.evaluationCriteria.controller');

const {
  getAllInterests,
  getInterestById,
  createInterest,
  updateInterest,
  deleteInterest,
  archiveInterest
} = require('../controllers/clo.interests.controller');

// All routes require CLO authentication
router.use(protect);
router.use(requireCLO);

// ====================
// Dashboard Routes
// ====================
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalyticsOverview);

// ====================
// Trainer Management
// ====================
router.get('/trainers', getAllTrainers);
router.post('/trainers', createTrainer);
router.put('/trainers/:id', updateTrainer);
router.delete('/trainers/:id', deactivateTrainer);
router.get('/trainers/:id/performance', getTrainerPerformance);
router.post('/trainers/:id/assign-course', assignTrainerToCourse);
router.delete('/trainers/:trainerId/courses/:courseId', removeTrainerFromCourse);

// ====================
// Course Management
// ====================
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseDetails);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.put('/courses/:id/archive', archiveCourse);
router.get('/courses/:id/statistics', getCourseStatistics);

// ====================
// Group Management
// ====================
router.get('/groups', getAllGroups);
router.get('/groups/:id', getGroupDetails);
router.post('/groups', createGroup);
router.put('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);
router.put('/groups/:id/status', closeGroup);
router.post('/groups/:id/assign-trainer', assignTrainerToGroup);
router.get('/groups/:id/students', getGroupStudents);
router.post('/groups/:id/students', addStudentToGroup);
router.delete('/groups/:id/students/:studentId', removeStudentFromGroup);

// ====================
// Evaluation Management (View Only)
// ====================
router.get('/evaluations', getAllEvaluations);
router.get('/evaluations/stats', getEvaluationStats);
router.get('/evaluations/group/:groupId', getGroupEvaluations);
router.get('/evaluations/:id', getEvaluationById);

// ====================
// Attendance Management (View Only)
// ====================
router.get('/attendance', getAllAttendance);
router.get('/attendance/stats', getAttendanceStats);
router.get('/attendance/course/:courseId', getCourseAttendance);
router.get('/attendance/:id', getAttendanceById);

// ====================
// Evaluation Criteria Management
// ====================
router.get('/evaluation-criteria', getAllCriteria);
router.get('/evaluation-criteria/:id', getCriteriaById);
router.post('/evaluation-criteria', createCriteria);
router.put('/evaluation-criteria/:id', updateCriteria);
router.delete('/evaluation-criteria/:id', deleteCriteria);

// ====================
// Interest Management
// ====================
router.get('/interests', getAllInterests);
router.get('/interests/:id', getInterestById);
router.post('/interests', createInterest);
router.put('/interests/:id', updateInterest);
router.delete('/interests/:id', deleteInterest);
router.put('/interests/:id/archive', archiveInterest);

module.exports = router;
