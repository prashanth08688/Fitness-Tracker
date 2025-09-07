// workout.js
const express = require('express');
const {
  addWorkout,
  getWorkoutsByUser,
  getLimitedRecentWorkouts,
  getWorkoutsByUserAndDate,
  deleteWorkout
} = require('./firebase');

const router = express.Router();

// POST /api/workouts
router.post('/', async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let { type, duration, calories, date } = req.body;
    duration = duration != null ? Number(duration) : null;
    calories = calories != null ? Number(calories) : null;

    if (!type || !duration || isNaN(duration)) {
      return res.status(400).json({ message: 'Please provide type and duration (minutes).' });
    }

    const workout = await addWorkout(userId, { type, duration, calories, date });
    res.status(201).json({ message: 'Workout added', workout });
  } catch (err) {
    console.error('Add workout error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/workouts
router.get('/', async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const workouts = await getWorkoutsByUser(userId);
    res.json({ workouts });
  } catch (err) {
    console.error('Get workouts error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/workouts/recent
router.get('/recent', async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const workouts = await getLimitedRecentWorkouts(userId, 3);
    res.json({ workouts });
  } catch (err) {
    console.error('Get recent workouts error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/workouts/by-date?date=YYYY-MM-DD
router.get('/by-date', async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const dateStr = req.query.date;
    if (!dateStr) return res.status(400).json({ message: 'Date query parameter is required' });

    const workouts = await getWorkoutsByUserAndDate(userId, dateStr);
    res.json({ workouts });
  } catch (err) {
    console.error('Get workouts by date error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Missing id' });
    await deleteWorkout(id);
    res.json({ message: 'Workout deleted successfully' });
  } catch (err) {
    console.error('Delete workout error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
