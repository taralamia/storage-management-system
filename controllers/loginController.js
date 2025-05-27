// external imports
const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// internal imports
const passport = require('passport');
require('../config/passport');
const User = require('../models/People');

const transporter = require('../middlewares/users/mailer');
require('dotenv').config();

function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString(); // Generates a 6-digit code
}
// post login
async function postLogin(req, res, next) {
  try {
    // Check if the user exists
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found. Please sign up.',
      });
    }
    // console.log('Provided password:', password);
    // console.log('Stored hashed password:', user.password);

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }
    // Create a JWT payload
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    // Sign the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    // Send the token in the response
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
    });
  }
}

// add user
async function addUser(req, res, next) {
  console.log('POST request received');

  // Ensure password and confirmPassword match
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
    });
  }

  try {
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = Date.now() + 24 * 60 * 60 * 1000;
    const newUser = new User({
      username: req.body.name,
      email: req.body.email,
      password: req.body.password,
      verificationCode,
      verificationCodeExpires,
    });

    console.log('Received body', req.body);

    if (!req.body.password || req.body.password.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    const result = await newUser.save();

    // Send verification email
    const mailOptions = {
      from: `"Storage Management System" <${process.env.EMAIL_FROM}>`, // Formal sender name
      to: req.body.email,
      subject: 'Verify Your Email Address for Storage Management System',
      text: `Your verification code is: ${verificationCode}\n\nThis code will expire in 24 hours.`,
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Storage Management System</h2>
      <p>Please use the following verification code to confirm your email address:</p>
      <div style="background: #f3f4f6; padding: 16px; margin: 16px 0; text-align: center; font-size: 24px; font-weight: bold;">
        ${verificationCode}
      </div>
      <p>This code will expire in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        © ${new Date().getFullYear()} Storage Management System. All rights reserved.
      </p>
    </div>
  `,
      headers: {
        'X-Mailer': 'NodeMailer',
        'X-Priority': '1',
        'List-Unsubscribe': `<mailto:${process.env.SUPPORT_EMAIL}>`,
      },
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message:
        'User registered successfully. Please check your email to verify your account!',
    });
  } catch (err) {
    console.error('Error in addUser:', err);
    return res.status(500).json({
      errors: {
        common: {
          msg: 'Unknown error occurred!',
        },
      },
    });
  }
}

// verify email endpoint
async function verifyEmail(req, res) {
  const { email, code } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not found.' });
    }

    // Check if the verification code matches
    if (user.verificationCode !== code) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid verification code.' });
    }

    // Check if the verification code has expired
    if (user.verificationCodeExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: 'Verification code has expired.' });
    }

    // Mark the user as verified
    user.verificationCode = undefined; // Clear the verification code
    user.verificationCodeExpires = undefined; // Clear the expiration time
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: 'Email verified successfully!' });
  } catch (err) {
    console.error('Error in email verification:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Unknown error occurred.' });
  }
}
// sign up with google
function googleAuth(req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email'] })(
    req,
    res,
    next,
  );
}
function googleAuthCallback(req, res, next) {
  passport.authenticate('google', async (err, user, info) => {
    if (err || !user) {
      console.error('Google Auth Error:', err || info);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please try again.',
      });
    }

    console.log('User Authenticated Successfully:', user);

    // Instead of redirecting, send JSON response
    return res.status(200).json({
      success: true,
      message: 'User authenticated successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profilePic: user.profilePic,
      },
    });
  })(req, res, next);
}
// forget and reset password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('No user found for email:', email);
      return res.status(400).json({
        success: false,
        message: 'User not found. Please sign up.',
      });
    }

    // Generate and save verification code (10-minute expiry)
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 600000; // 10 mins
    await user.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Verification Code',
      text: `Your verification code: ${verificationCode}\n\nExpires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent. Check your inbox.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
}
async function resetPassword(req, res, next) {
  try {
    const { email, verificationCode, password } = req.body;

    // Find user with valid code
    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationCode,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code. Request a new reset.',
      });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          verificationCode: undefined,
          verificationCodeExpires: undefined,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! Log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
}
module.exports = {
  addUser,
  verifyEmail,
  googleAuth,
  googleAuthCallback,
  postLogin,
  forgotPassword,
  resetPassword,
};
