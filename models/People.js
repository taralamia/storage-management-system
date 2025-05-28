const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const peopleSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required() {
        return !this.googleId;
      }, // Only required for email signup
    },
    avatar: {
      type: [String],
    },
    notes: {
      type: [String],
    },
    pdf: {
      type: [String],
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    isPasswordHashed: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  },
);

// Proper async pre-save hook
peopleSchema.pre('save', async function (next) {
  try {
    // Validation
    const isEmailSignup = !this.googleId;
    const isGoogleSignup = !!this.googleId;

    if (isEmailSignup && !this.password) {
      throw new Error('Password is required for email signup');
    }

    if (!isEmailSignup && !isGoogleSignup) {
      throw new Error('Either Google ID or Password must be provided');
    }

    // Password hashing
    if ((this.isModified('password') || this.isNew) && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this.isPasswordHashed = true;
    }

    next();
  } catch (error) {
    next(error);
  }
});

const People = mongoose.model('People', peopleSchema, 'people');
module.exports = People;
