const express = require('express');
const router = express.Router();

const {
  createInquiry,
  getAllInquiries,
  getBrokerInquiries,
  updateInquiryStatus,
  getUserInquiries
} = require('../Controllers/InquiryController');

const {
  verifyToken,
  allowRoles
} = require('../Middlewares/AuthMiddleware');


// CREATE INQUIRY
router.post('/', createInquiry);


// GET ALL INQUIRIES (ADMIN)
router.get(
  '/',
  verifyToken,
  allowRoles('admin'),
  getAllInquiries
);


// GET BROKER INQUIRIES
router.get(
  '/broker',
  verifyToken,
  allowRoles('broker'),
  getBrokerInquiries
);



// USER INQUIRIES
router.get('/user/:email', getUserInquiries);


// UPDATE INQUIRY STATUS
router.patch(
  "/:id/status",
  verifyToken,
  allowRoles('broker'),
  updateInquiryStatus
);


module.exports = router;