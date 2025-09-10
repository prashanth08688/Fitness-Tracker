require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./auth');
const workoutRoutes = require('./workout');
const authMiddleware = require('./middleware'); // exports function

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.use('/api/auth', authRoutes);
app.use('/api/workouts', authMiddleware, workoutRoutes);

app.get('/', (req, res) => res.send('Fitness Tracker API is running'));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

