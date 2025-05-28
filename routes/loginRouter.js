// external imports
const express = require('express');

const router = express.Router();
// internal imports
const User = require('../models/People');
const { addUserValidators } = require('../middlewares/users/userValidators');
const {
  addUser,
  verifyEmail,
  googleAuth,
  googleAuthCallback,
  postLogin,
  forgetPassword,
  resetPassword,
} = require('../controllers/loginController');

// create user without google
router.post('/signup', addUserValidators, addUser);
router.post('/verifyEmail', verifyEmail);
// sign up with google
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);
//  POST route for login functionality
router.post('/postLogin', postLogin);
// forget password
router.post('/forget-password', forgetPassword);
// reset password
router.post('/reset-password', resetPassword);
module.exports = router;
