const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const Employee = require('../models/Employee');
const {
  generateUniqueShareSlug,
  generateFallbackEmployeeNumber,
} = require('../utils/userHelpers');

const sqlitePath = path.resolve(__dirname, '../database.sqlite');

const openSqlite = (filePath) =>
  new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filePath, sqlite3.OPEN_READONLY, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(db);
    });
  });

const readAll = (db, sql) =>
  new Promise((resolve, reject) => {
    db.all(sql, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });

const closeSqlite = (db) =>
  new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const normalizeString = (value, fallback = '') =>
  typeof value === 'string' ? value.trim() : fallback;

const normalizeOptionalString = (value) => {
  const trimmed = normalizeString(value);
  return trimmed ? trimmed : undefined;
};

const normalizeDate = (value) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
};

const resolveUserEmployeeNumber = async (row) => {
  const preferred = normalizeOptionalString(row.employeeNumber)?.toUpperCase();

  if (preferred) {
    return preferred;
  }

  const sqliteBasedEmployeeNumber = `EMP-${String(row.id).padStart(4, '0')}`;
  const existingUser = await User.findOne({ employeeNumber: sqliteBasedEmployeeNumber }).lean();

  if (!existingUser) {
    return sqliteBasedEmployeeNumber;
  }

  return generateFallbackEmployeeNumber();
};

const resolveUserShareSlug = async (rowShareSlug, employeeNumber) => {
  const preferred = normalizeOptionalString(rowShareSlug);

  if (!preferred) {
    return generateUniqueShareSlug();
  }

  const existingUser = await User.findOne({ shareSlug: preferred }).lean();

  if (!existingUser || existingUser.employeeNumber === employeeNumber) {
    return preferred;
  }

  return generateUniqueShareSlug();
};

const migrateUsers = async (rows) => {
  let migratedCount = 0;

  for (const row of rows) {
    const employeeNumber = await resolveUserEmployeeNumber(row);
    const shareSlug = await resolveUserShareSlug(row.shareSlug, employeeNumber);

    await User.findOneAndUpdate(
      { employeeNumber },
      {
        employeeNumber,
        email: normalizeOptionalString(row.email)?.toLowerCase(),
        linkedinUrl: normalizeString(row.linkedinUrl),
        password: row.password,
        fullName: normalizeString(row.fullName),
        department: normalizeString(row.department),
        jobRole: normalizeString(row.jobRole),
        phoneNumber: normalizeString(row.phoneNumber),
        company: normalizeString(row.company).toUpperCase(),
        profileImage: typeof row.profileImage === 'string' ? row.profileImage : '',
        shareSlug,
        role: row.role === 'admin' ? 'admin' : 'employee',
        createdAt: normalizeDate(row.createdAt),
        updatedAt: normalizeDate(row.updatedAt),
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );

    migratedCount += 1;
  }

  return migratedCount;
};

const migrateEmployees = async (rows) => {
  let migratedCount = 0;

  for (const row of rows) {
    const employeeId = normalizeString(row.employeeId);

    if (!employeeId) {
      continue;
    }

    await Employee.findOneAndUpdate(
      { employeeId },
      {
        employeeId,
        name: normalizeString(row.name),
        position: normalizeString(row.position),
        address: normalizeString(row.address),
        phoneNumber: normalizeString(row.phoneNumber),
        company: normalizeString(row.company),
        createdAt: normalizeDate(row.createdAt),
        updatedAt: normalizeDate(row.updatedAt),
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );

    migratedCount += 1;
  }

  return migratedCount;
};

const run = async () => {
  if (!fs.existsSync(sqlitePath)) {
    console.log(`No SQLite database found at ${sqlitePath}. Nothing to migrate.`);
    return;
  }

  let sqliteDb;

  try {
    await connectDB();
    sqliteDb = await openSqlite(sqlitePath);

    const [userRows, employeeRows] = await Promise.all([
      readAll(sqliteDb, 'SELECT * FROM Users'),
      readAll(sqliteDb, 'SELECT * FROM Employees'),
    ]);

    const migratedUsers = await migrateUsers(userRows);
    const migratedEmployees = await migrateEmployees(employeeRows);

    console.log(`Migrated ${migratedUsers} users to MongoDB.`);
    console.log(`Migrated ${migratedEmployees} employees to MongoDB.`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    if (sqliteDb) {
      await closeSqlite(sqliteDb);
    }

    await mongoose.connection.close();
  }
};

run();
