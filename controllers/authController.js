const AuthService = require('../services/authService');

async function postLogin(req, res, next) {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function addUser(req, res, next) {
  try {
    const result = await AuthService.registerUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const result = await AuthService.verifyEmail(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

function googleAuth(req, res, next) {
  AuthService.handleGoogleAuth(req, res, next);
}

function googleAuthCallback(req, res, next) {
  AuthService.handleGoogleAuthCallback(req, res, next);
}

async function forgetPassword(req, res, next) {
  try {
    const result = await AuthService.forgetPassword(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await AuthService.resetPassword(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
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
