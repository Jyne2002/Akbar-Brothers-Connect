const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { escapeRegex } = require('../utils/search');
const { generateUniqueShareSlug } = require('../utils/userHelpers');

const MIN_PASSWORD_LENGTH = 6;
const EMPLOYEE_NUMBER_REGEX = /^\d{4}$/;
const PHONE_NUMBER_REGEX = /^\d{10}$/;
const EXTENSION_NUMBER_REGEX = /^\d{1,6}$/;

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

const isProfileComplete = (user) =>
  Boolean(
    user.fullName?.trim() &&
      user.department?.trim() &&
      user.jobRole?.trim() &&
      user.phoneNumber?.trim() &&
      user.mobileNumber?.trim() &&
      user.email?.trim() &&
      ['A', 'B', 'C'].includes(user.company),
  );

const serializeUser = (user) => ({
  _id: user._id,
  employeeNumber: user.employeeNumber,
  email: user.email,
  linkedinUrl: user.linkedinUrl,
  whatsappNumber: user.whatsappNumber,
  role: user.role,
  fullName: user.fullName,
  department: user.department,
  jobRole: user.jobRole,
  phoneNumber: user.phoneNumber,
  mobileNumber: user.mobileNumber,
  extensionNumber: user.extensionNumber,
  company: user.company,
  profileImage: user.profileImage,
  shareSlug: user.shareSlug,
  profileCompleted: isProfileComplete(user),
  token: generateToken(String(user._id), user.role),
});

const serializeManagedUser = (user) => ({
  _id: user._id,
  employeeNumber: user.employeeNumber,
  email: user.email,
  linkedinUrl: user.linkedinUrl,
  whatsappNumber: user.whatsappNumber,
  role: user.role,
  fullName: user.fullName,
  department: user.department,
  jobRole: user.jobRole,
  phoneNumber: user.phoneNumber,
  mobileNumber: user.mobileNumber,
  extensionNumber: user.extensionNumber,
  company: user.company,
  profileImage: user.profileImage,
  shareSlug: user.shareSlug,
  profileCompleted: isProfileComplete(user),
});

const serializePublicUser = (user) => ({
  _id: user._id,
  employeeNumber: user.employeeNumber,
  fullName: user.fullName,
  email: user.email,
  linkedinUrl: user.linkedinUrl,
  whatsappNumber: user.whatsappNumber,
  department: user.department,
  jobRole: user.jobRole,
  phoneNumber: user.phoneNumber,
  mobileNumber: user.mobileNumber,
  extensionNumber: user.extensionNumber,
  company: user.company,
  profileImage: user.profileImage,
  shareSlug: user.shareSlug,
});

const normalizeUserUpdates = (payload) => {
  const nextEmail = payload.email?.trim().toLowerCase();
  const nextLinkedinUrl =
    typeof payload.linkedinUrl === 'string' ? payload.linkedinUrl.trim() : undefined;
  const nextWhatsappNumber =
    typeof payload.whatsappNumber === 'string' ? payload.whatsappNumber.trim() : undefined;
  const nextFullName = payload.fullName?.trim();
  const nextDepartment = payload.department?.trim();
  const nextJobRole = payload.jobRole?.trim();
  const nextPhoneNumber = payload.phoneNumber?.trim();
  const nextMobileNumber = payload.mobileNumber?.trim();
  const nextExtensionNumber =
    typeof payload.extensionNumber === 'string' ? payload.extensionNumber.trim() : undefined;
  const nextCompany = payload.company ? payload.company.trim().toUpperCase() : undefined;
  const nextProfileImage =
    typeof payload.profileImage === 'string' ? payload.profileImage.trim() : undefined;

  return {
    email: nextEmail,
    linkedinUrl: nextLinkedinUrl,
    whatsappNumber: nextWhatsappNumber,
    fullName: nextFullName,
    department: nextDepartment,
    jobRole: nextJobRole,
    phoneNumber: nextPhoneNumber,
    mobileNumber: nextMobileNumber,
    extensionNumber: nextExtensionNumber,
    company: nextCompany,
    profileImage: nextProfileImage,
  };
};

const isDuplicateKeyError = (error) => error?.name === 'MongoServerError' && error?.code === 11000;

const isValidId = (value) => mongoose.isValidObjectId(value);

const isValidEmployeeNumber = (value) => EMPLOYEE_NUMBER_REGEX.test(String(value || '').trim());
const isValidPhoneNumber = (value) => PHONE_NUMBER_REGEX.test(String(value || '').trim());
const isValidExtensionNumber = (value) =>
  !String(value || '').trim() || EXTENSION_NUMBER_REGEX.test(String(value || '').trim());
const isValidEmailAddress = (value) => {
  const normalizedValue = String(value || '').trim();

  return normalizedValue.includes('@');
};

const sanitizePublicPathPart = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getPublicFirstNameSegment = (fullName) =>
  sanitizePublicPathPart(String(fullName || '').trim().split(/\s+/).find(Boolean) || '');

const buildPublicIdentitySegment = (fullName, employeeNumber) =>
  [getPublicFirstNameSegment(fullName), sanitizePublicPathPart(employeeNumber)]
    .filter(Boolean)
    .join('-');

const extractEmployeeNumberFromPublicSlug = (publicSlug) => {
  const segments = sanitizePublicPathPart(publicSlug)
    .split('-')
    .filter(Boolean);
  const employeeNumber = segments[segments.length - 1] || '';

  return isValidEmployeeNumber(employeeNumber) ? employeeNumber.toUpperCase() : '';
};

const matchesPublicIdentitySlug = (publicSlug, user) => {
  const normalizedSlug = sanitizePublicPathPart(publicSlug);
  const canonicalSlug = buildPublicIdentitySegment(user?.fullName, user?.employeeNumber);

  if (!normalizedSlug || !canonicalSlug) {
    return false;
  }

  if (normalizedSlug === canonicalSlug) {
    return true;
  }

  const firstNameSegment = getPublicFirstNameSegment(user?.fullName);
  const employeeNumberSegment = sanitizePublicPathPart(user?.employeeNumber);

  return Boolean(
    firstNameSegment &&
      employeeNumberSegment &&
      normalizedSlug.startsWith(`${firstNameSegment}-`) &&
      normalizedSlug.endsWith(`-${employeeNumberSegment}`),
  );
};

const findPublicUserBySlug = async (publicSlug) => {
  const normalizedSlug = String(publicSlug || '').trim();

  if (!normalizedSlug) {
    return null;
  }

  const directMatch = await User.findOne({ shareSlug: normalizedSlug }).lean();

  if (directMatch) {
    return directMatch;
  }

  const employeeNumber = extractEmployeeNumberFromPublicSlug(normalizedSlug);

  if (!employeeNumber) {
    return null;
  }

  const identityMatch = await User.findOne({ employeeNumber }).lean();

  if (!identityMatch || !matchesPublicIdentitySlug(normalizedSlug, identityMatch)) {
    return null;
  }

  return identityMatch;
};

const getProfileUpdateValidationMessage = (normalized) => {
  if (
    !normalized.email ||
    !normalized.fullName ||
    !normalized.department ||
    !normalized.jobRole ||
    !normalized.phoneNumber ||
    !normalized.mobileNumber ||
    !normalized.company
  ) {
    return 'Please complete all profile fields before saving';
  }

  if (!['A', 'B', 'C'].includes(normalized.company)) {
    return 'Please select a valid company';
  }

  if (!isValidEmailAddress(normalized.email)) {
    return 'Email address must include @';
  }

  if (!isValidPhoneNumber(normalized.phoneNumber)) {
    return 'Phone number must be exactly 10 digits';
  }

  if (!isValidPhoneNumber(normalized.mobileNumber)) {
    return 'Mobile number must be exactly 10 digits';
  }

  if (!isValidExtensionNumber(normalized.extensionNumber)) {
    return 'EXT number must be 1 to 6 digits';
  }

  if (normalized.whatsappNumber && !isValidPhoneNumber(normalized.whatsappNumber)) {
    return 'WhatsApp number must be exactly 10 digits';
  }

  return '';
};

const ensureUniqueEmailForUser = async (normalizedEmail, currentEmail, userId) => {
  if (normalizedEmail === currentEmail) {
    return '';
  }

  const existingUser = await User.findOne({ email: normalizedEmail }).lean();

  if (existingUser && String(existingUser._id) !== String(userId)) {
    return 'Email address is already in use';
  }

  return '';
};

const applyNormalizedUserUpdates = (user, normalized) => {
  user.email = normalized.email;
  user.linkedinUrl = normalized.linkedinUrl ?? user.linkedinUrl;
  user.whatsappNumber = normalized.whatsappNumber ?? user.whatsappNumber;
  user.fullName = normalized.fullName;
  user.department = normalized.department;
  user.jobRole = normalized.jobRole;
  user.phoneNumber = normalized.phoneNumber;
  user.mobileNumber = normalized.mobileNumber;
  user.extensionNumber = normalized.extensionNumber ?? user.extensionNumber;
  user.company = normalized.company;
  user.profileImage = normalized.profileImage ?? user.profileImage;
};

const registerUser = async (req, res) => {
  const { employeeNumber, password } = req.body;
  const normalizedEmployeeNumber = employeeNumber?.trim().toUpperCase();
  const normalizedPassword = typeof password === 'string' ? password.trim() : '';

  try {
    if (!normalizedEmployeeNumber || !normalizedPassword) {
      return res.status(400).json({ message: 'Employee number and password are required' });
    }

    if (!isValidEmployeeNumber(normalizedEmployeeNumber)) {
      return res.status(400).json({ message: 'Employee number must be exactly 4 digits' });
    }

    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
    }

    const userExists = await User.findOne({ employeeNumber: normalizedEmployeeNumber });
    if (userExists) {
      return res.status(400).json({ message: 'Employee number is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(normalizedPassword, salt);

    const user = await User.create({
      employeeNumber: normalizedEmployeeNumber,
      password: hashedPassword,
      shareSlug: await generateUniqueShareSlug(),
      role: 'employee',
      email: undefined,
      linkedinUrl: '',
      whatsappNumber: '',
      fullName: '',
      department: '',
      jobRole: '',
      phoneNumber: '',
      mobileNumber: '',
      extensionNumber: '',
      company: '',
      profileImage: '',
    });

    res.status(201).json(serializeUser(user));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(400).json({ message: 'Employee number is already registered' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { employeeNumber, password } = req.body;
  const normalizedEmployeeNumber = employeeNumber?.trim().toUpperCase();

  try {
    if (!isValidEmployeeNumber(normalizedEmployeeNumber)) {
      return res.status(400).json({ message: 'Employee number must be exactly 4 digits' });
    }

    const user = await User.findOne({ employeeNumber: normalizedEmployeeNumber });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json(serializeUser(user));
    } else {
      res.status(401).json({ message: 'Invalid employee number or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getManagedUserById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(serializeManagedUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPublicUserProfile = async (req, res) => {
  const publicSlug = req.params.shareSlug?.trim();

  try {
    if (!publicSlug) {
      return res.status(400).json({ message: 'A share link is required' });
    }

    const user = await findPublicUserBySlug(publicSlug);

    if (!user || !isProfileComplete(user)) {
      return res.status(404).json({ message: 'Profile card not found' });
    }

    res.json(serializePublicUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalized = normalizeUserUpdates(req.body);
    const validationMessage = getProfileUpdateValidationMessage(normalized);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const duplicateEmailMessage = await ensureUniqueEmailForUser(
      normalized.email,
      user.email,
      user._id,
    );

    if (duplicateEmailMessage) {
      return res.status(400).json({ message: duplicateEmailMessage });
    }

    applyNormalizedUserUpdates(user, normalized);
    await user.save();

    res.json(serializeUser(user));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(400).json({ message: 'Email address is already in use' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateManagedUserProfile = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalized = normalizeUserUpdates(req.body);
    const validationMessage = getProfileUpdateValidationMessage(normalized);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const duplicateEmailMessage = await ensureUniqueEmailForUser(
      normalized.email,
      user.email,
      user._id,
    );

    if (duplicateEmailMessage) {
      return res.status(400).json({ message: duplicateEmailMessage });
    }

    applyNormalizedUserUpdates(user, normalized);
    await user.save();

    res.json(serializeManagedUser(user));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(400).json({ message: 'Email address is already in use' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUsers = async (req, res) => {
  const { role, search } = req.query;

  try {
    const query = {};
    const trimmedSearch = search?.trim();

    if (role === 'admin' || role === 'employee') {
      query.role = role;
    }

    if (trimmedSearch) {
      const searchRegex = new RegExp(escapeRegex(trimmedSearch), 'i');
      query.$or = [
        { employeeNumber: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { jobRole: searchRegex },
        { phoneNumber: searchRegex },
        { whatsappNumber: searchRegex },
        { mobileNumber: searchRegex },
        { extensionNumber: searchRegex },
        { company: searchRegex },
      ];
    }

    const users = await User.find(query).sort({ role: -1, employeeNumber: 1 }).lean();
    res.json(users.map(serializeManagedUser));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'employee'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided' });
  }

  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(user._id) === String(req.user.id) && role !== 'admin') {
      return res
        .status(400)
        .json({ message: 'Use another admin account to remove your own admin access' });
    }

    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });

      if (adminCount <= 1) {
        return res.status(400).json({ message: 'At least one admin account must remain in the system' });
      }
    }

    user.role = role;
    await user.save();

    res.json(serializeManagedUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account from the admin panel' });
    }

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });

      if (adminCount <= 1) {
        return res.status(400).json({ message: 'At least one admin account must remain in the system' });
      }
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getManagedUserById,
  getPublicUserProfile,
  updateUserProfile,
  updateManagedUserProfile,
  getUsers,
  updateUserRole,
  deleteUser,
};
