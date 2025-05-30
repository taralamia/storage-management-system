const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const createError = require('http-errors');
const User = require('../models/People');
const transporter = require('../middlewares/users/mailer');
require('dotenv').config();

function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString();
}

async function registerUser(body) {
  const { username, email, password, confirmPassword } = body;

  if (password !== confirmPassword) {
    throw createError(400, 'Passwords do not match');
  }

  if (!password || password.length === 0) {
    throw createError(400, 'Password is required');
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = Date.now() + 24 * 60 * 60 * 1000;

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    verificationCode,
    verificationCodeExpires,
  });

  await newUser.save();

  const mailOptions = {
    from: `"Storage Management System" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <h2>Storage Management System</h2>
      <p>Your verification code is:</p>
      <h3>${verificationCode}</h3>
      <p>This code expires in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);

  return {
    success: true,
    message: 'User registered. Check email for verification code.',
  };
}

async function verifyEmail({ email, code }) {
  const user = await User.findOne({ email });
  if (!user) throw createError(400, 'User not found.');
  if (user.verificationCode !== code)
    throw createError(400, 'Invalid verification code.');
  if (user.verificationCodeExpires < Date.now())
    throw createError(400, 'Verification code expired.');

  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  return { success: true, message: 'Email verified successfully.' };
}

async function login({ email, password }) {
  if (!email) throw createError(400, 'Email is required');

  const user = await User.findOne({ email });
  if (!user) throw createError(400, 'User not found. Please sign up.');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw createError(400, 'Invalid credentials.');

  const payload = { id: user._id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  return {
    success: true,
    message: 'Login successful!',
    token: `Bearer ${token}`,
  };
}

function handleGoogleAuth(req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email'] })(
    req,
    res,
    next,
  );
}

function handleGoogleAuthCallback(req, res, next) {
  passport.authenticate('google', async (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Google sign-in successful.',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profilePic: user.profilePic,
      },
    });
  })(req, res, next);
}

async function forgetPassword({ email }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw createError(400, 'User not found.');

  const verificationCode = generateVerificationCode();
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Password Reset Code',
    text: `Your code: ${verificationCode}. Expires in 10 mins.`,
  };

  await transporter.sendMail(mailOptions);

  return {
    success: true,
    message: 'Password reset code sent to email.',
  };
}

async function resetPassword({ email, verificationCode, password }) {
  const user = await User.findOne({
    email: email.toLowerCase(),
    verificationCode,
    verificationCodeExpires: { $gt: Date.now() },
  });

  if (!user) throw createError(400, 'Invalid or expired code.');

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  return {
    success: true,
    message: 'Password reset successful. Log in with new password.',
  };
}

module.exports = {
  registerUser,
  verifyEmail,
  login,
  handleGoogleAuth,
  handleGoogleAuthCallback,
  forgetPassword,
  resetPassword,
};
