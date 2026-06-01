const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeCounts,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/counts', protect, getEmployeeCounts);

router.route('/')
  .get(protect, getEmployees)
  .post(protect, adminOnly, createEmployee);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, adminOnly, updateEmployee)
  .delete(protect, adminOnly, deleteEmployee);

module.exports = router;
