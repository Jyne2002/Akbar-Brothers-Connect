const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { escapeRegex } = require('../utils/search');

const isDuplicateKeyError = (error) => error?.name === 'MongoServerError' && error?.code === 11000;

const getEmployees = async (req, res) => {
  const { company, search } = req.query;

  try {
    const query = {};

    if (company?.trim()) {
      query.company = company.trim();
    }

    if (search?.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { name: searchRegex },
        { employeeId: searchRegex },
        { position: searchRegex },
        { phoneNumber: searchRegex },
        { address: searchRegex },
        { company: searchRegex },
      ];
    }

    const employees = await Employee.find(query).lean();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEmployeeCounts = async (_req, res) => {
  try {
    const counts = await Employee.aggregate([
      {
        $group: {
          _id: '$company',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(
      counts.reduce((accumulator, entry) => {
        if (entry?._id) {
          accumulator[entry._id] = entry.count;
        }

        return accumulator;
      }, {}),
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee = await Employee.findById(req.params.id).lean();

    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const newEmployee = await Employee.create(req.body);
    res.status(201).json(newEmployee);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(400).json({ message: 'Employee ID already exists', error: error.message });
    }

    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    Object.assign(employee, req.body);
    await employee.save();

    res.json(employee);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(400).json({ message: 'Employee ID already exists', error: error.message });
    }

    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.deleteOne();
    res.json({ message: 'Employee removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeCounts,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
