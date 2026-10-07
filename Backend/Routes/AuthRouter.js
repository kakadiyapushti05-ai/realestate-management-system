const express = require('express');
const router = express.Router();

const upload = require('../Middlewares/upload');

const {
  signup,
  login,
  getMyProfile,
  getAllBrokers,
  getAllUsers,
  updateProfile,
  forgotPassword,
  deleteUser,
    logoutUser,
     sendOTP,             
  verifyOTPAndReset

  } = require('../Controllers/AuthController');

const {
  signupvalidation,
  loginvalidation
} = require('../Middlewares/AuthValidation');

const {
  verifyToken,
  allowRoles
} = require('../Middlewares/AuthMiddleware');

router.delete(
  '/user/:id',
  verifyToken,
  allowRoles('admin'),
  deleteUser
);
router.put('/logout', verifyToken, logoutUser);

// SIGNUP
router.post(
  '/signup',
  upload.single("profileImage"),
  signupvalidation,
  signup
);

// LOGIN
router.post('/login', loginvalidation, login);

// GET PROFILE
router.get('/me', verifyToken, getMyProfile);

// UPDATE PROFILE
router.put(
  '/update-profile',
  verifyToken,
  upload.single("profileImage"),
  updateProfile
);

router.post('/forgot-password', forgotPassword);
// ADMIN GET BROKERS
router.get(
  '/brokers',
  verifyToken,
  allowRoles('admin'),
  getAllBrokers
);

// ADMIN GET USERS
router.get(
  '/users',
  verifyToken,
  allowRoles('admin'),
  getAllUsers
);

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPAndReset);

module.exports = router;