const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');
const {
  generateUniqueShareSlug,
  generateFallbackEmployeeNumber,
} = require('./utils/userHelpers');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Backend API running with MongoDB');
});

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

const normalizeLegacyUsers = async () => {
  const legacyUsers = await User.find({
    $or: [
      { employeeNumber: { $exists: false } },
      { employeeNumber: null },
      { employeeNumber: '' },
      { shareSlug: { $exists: false } },
      { shareSlug: null },
      { shareSlug: '' },
    ],
  });

  for (const user of legacyUsers) {
    let didChange = false;

    if (!user.employeeNumber?.trim()) {
      user.employeeNumber = await generateFallbackEmployeeNumber();
      didChange = true;
    }

    if (!user.shareSlug?.trim()) {
      user.shareSlug = await generateUniqueShareSlug();
      didChange = true;
    }

    if (didChange) {
      await user.save();
    }
  }
};

const startServer = async () => {
  try {
    const connection = await connectDB();
    await normalizeLegacyUsers();

    console.log(`MongoDB Connected: ${connection.host}/${connection.name}`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
