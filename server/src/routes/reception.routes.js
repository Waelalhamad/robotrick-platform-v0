const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  getRecentEnrollments,
  getRecentActivities
} = require('../controllers/reception.controller');
const {
  getAllEnrollments,
  createEnrollment,
  updateEnrollment,
  recordPayment,
  getAvailableCourses,
  getAvailableGroups,
  getAvailableStudents
} = require('../controllers/reception.enrollment.controller');
const {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertToStudent,
  addFollowUp,
  getLeadStats,
  changeLeadStatus
} = require('../controllers/reception.lead.controller');
const {
  createReceipt,
  getReceipt,
  downloadReceipt,
  getEnrollmentReceipts
} = require('../controllers/receipt.controller');
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/reception.event.controller');
const {
  getContactHistoryByLead,
  createContactHistory,
  updateContactHistory,
  deleteContactHistory,
  getContactHistoryStats
} = require('../controllers/reception.contacthistory.controller');
const { getAllInterests } = require('../controllers/clo.interests.controller');
const { protect, requireReception } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and reception role
router.use(protect);
router.use(requireReception);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/recent-enrollments', getRecentEnrollments);
router.get('/recent-activities', getRecentActivities);

// User management
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .put(updateUser)
  .delete(deactivateUser);

router.patch('/users/:id/reactivate', reactivateUser);

// Helper endpoints for enrollment form (must come BEFORE :id route)
router.get('/enrollments/available-courses', getAvailableCourses);
router.get('/enrollments/available-groups/:courseId', getAvailableGroups);
router.get('/enrollments/available-students', getAvailableStudents);

// Enrollment management
router.route('/enrollments')
  .get(getAllEnrollments)
  .post(createEnrollment);

router.route('/enrollments/:id')
  .put(updateEnrollment);

router.post('/enrollments/:id/payment', recordPayment);

// Interests (for lead form)
router.get('/interests', getAllInterests);

// Lead management (helper endpoints first)
router.get('/leads/stats', getLeadStats);

router.route('/leads')
  .get(getAllLeads)
  .post(createLead);

router.route('/leads/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.post('/leads/:id/convert', convertToStudent);
router.post('/leads/:id/follow-up', addFollowUp);
router.post('/leads/:id/change-status', changeLeadStatus);

// Contact History management (helper endpoints first)
router.get('/contact-history/stats', getContactHistoryStats);

router.route('/leads/:leadId/contact-history')
  .get(getContactHistoryByLead)
  .post(createContactHistory);

router.route('/contact-history/:id')
  .put(updateContactHistory)
  .delete(deleteContactHistory);

// Receipt management (helper endpoints first)
router.get('/receipts/enrollment/:enrollmentId', getEnrollmentReceipts);

router.route('/receipts')
  .post(createReceipt);

router.route('/receipts/:id')
  .get(getReceipt);

router.get('/receipts/:id/download', downloadReceipt);

// Event management
router.route('/events')
  .get(getEvents)
  .post(createEvent);

router.route('/events/:id')
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;
