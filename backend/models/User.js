const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    employeeNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: undefined,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: '',
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    jobRole: {
      type: String,
      trim: true,
      default: '',
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: '',
    },
    extensionNumber: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    shareSlug: {
      type: String,
      trim: true,
      default: undefined,
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index(
  { employeeNumber: 1 },
  { unique: true, partialFilterExpression: { employeeNumber: { $type: 'string' } } },
);
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } },
);
userSchema.index(
  { shareSlug: 1 },
  { unique: true, partialFilterExpression: { shareSlug: { $type: 'string' } } },
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
