const express = require('express');
const router = express.Router();

const { addUserValidator } = require('../../middlewares/users/userValidators');
const {
  addUser,
  verifyEmail,
  postLogin,
  forgetPassword,
  resetPassword,
} = require('../../controllers/authController');

router.post('/signup', addUserValidator, addUser);
router.post('/verify-email', verifyEmail);
router.post('/post-login', postLogin);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);

module.exports = router;