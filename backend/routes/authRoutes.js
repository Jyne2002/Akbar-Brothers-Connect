const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/public-profile/:shareSlug', getPublicUserProfile);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.get('/users', protect, adminOnly, getUsers);
router.route('/users/:id')
  .get(protect, adminOnly, getManagedUserById)
  .put(protect, adminOnly, updateManagedUserProfile)
  .delete(protect, adminOnly, deleteUser);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;
