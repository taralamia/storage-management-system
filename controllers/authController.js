const createError = require('http-errors');
const AuthService = require('../services/authService');

async function postLogin(req, res, next) {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(createError(error.status || 500, error.message || 'Login failed'));
  }
}

async function addUser(req, res, next) {
  try {
    const result = await AuthService.registerUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(createError(error.status || 500, error.message || 'User registration failed'));
  }
}

async function verifyEmail(req, res, next) {
  try {
    const result = await AuthService.verifyEmail(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(createError(error.status || 500, error.message || 'Email verification failed'));
  }
}

function googleAuth(req, res, next) {
  try {
    AuthService.handleGoogleAuth(req, res, next);
  } catch (error) {
    next(createError(500, 'Google authentication failed'));
  }
}

function googleAuthCallback(req, res, next) {
  try {
    AuthService.handleGoogleAuthCallback(req, res, next);
  } catch (error) {
    next(createError(500, 'Google authentication callback failed'));
  }
}

async function forgetPassword(req, res, next) {
  try {
    const result = await AuthService.forgetPassword(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(createError(error.status || 500, error.message || 'Failed to initiate password reset'));
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await AuthService.resetPassword(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(createError(error.status || 500, error.message || 'Password reset failed'));
  }
}

module.exports = {
  addUser,
  verifyEmail,
  googleAuth,
  googleAuthCallback,
  postLogin,
  forgetPassword,
  resetPassword,
};
