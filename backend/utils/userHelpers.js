const crypto = require('crypto');
const User = require('../models/User');

const createShareSlug = () => crypto.randomBytes(12).toString('hex');

const generateUniqueShareSlug = async () => {
  let shareSlug = createShareSlug();

  while (await User.exists({ shareSlug })) {
    shareSlug = createShareSlug();
  }

  return shareSlug;
};

const generateFallbackEmployeeNumber = async () => {
  let employeeNumber = `EMP-${String((await User.countDocuments()) + 1).padStart(4, '0')}`;

  while (await User.exists({ employeeNumber })) {
    employeeNumber = `EMP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  return employeeNumber;
};

module.exports = {
  generateUniqueShareSlug,
  generateFallbackEmployeeNumber,
};
