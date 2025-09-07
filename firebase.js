// firebase.js
const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require('./service-account-key.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || undefined
  });
}

const db = admin.firestore();

// Collections
const usersCollection = db.collection('users');
const workoutsCollection = db.collection('workouts');

/* ---------------- USERS ---------------- */

async function getUserByUsername(username) {
  const snap = await usersCollection.where('username', '==', username).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function getUserByEmail(email) {
  const snap = await usersCollection.where('email', '==', email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function getUserByUsernameOrEmail(value) {
  let user = await getUserByUsername(value);
  if (user) return user;
  user = await getUserByEmail(value);
  return user;
}

// createUser expects object { username, email, password } where password is already hashed
async function createUser(userObj) {
  const docRef = await usersCollection.add(userObj);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

/* ---------------- WORKOUTS ---------------- */

// format Firestore doc to plain JSON with ISO strings
function formatWorkoutDoc(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    type: data.type || '',
    duration: data.duration != null ? Number(data.duration) : null,
    calories: data.calories != null ? Number(data.calories) : null,
    userId: data.userId || null,
    date: data.date && data.date.toDate ? data.date.toDate().toISOString() : (data.date || null),
    createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || null)
  };
}

async function addWorkout(userId, workoutData) {
  const adminTS = admin.firestore.Timestamp;
  let dateTS;
  if (workoutData.date && !isNaN(Date.parse(workoutData.date))) {
    dateTS = adminTS.fromDate(new Date(workoutData.date));
  } else {
    dateTS = adminTS.now();
  }

  const docRef = await workoutsCollection.add({
    userId,
    type: workoutData.type || '',
    duration: workoutData.duration != null ? Number(workoutData.duration) : null,
    calories: workoutData.calories != null ? Number(workoutData.calories) : null,
    date: dateTS,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  const saved = await docRef.get();
  return formatWorkoutDoc(saved);
}

async function getWorkoutsByUser(userId) {
  const snap = await workoutsCollection
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .get();

  return snap.docs.map(formatWorkoutDoc);
}

async function getLimitedRecentWorkouts(userId, limit = 3) {
  const snap = await workoutsCollection
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .limit(limit)
    .get();

  return snap.docs.map(formatWorkoutDoc);
}

// dateStr expected 'YYYY-MM-DD'
async function getWorkoutsByUserAndDate(userId, dateStr) {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return [];
  const [y, m, d] = parts;
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);

  const snap = await workoutsCollection
    .where('userId', '==', userId)
    .where('date', '>=', admin.firestore.Timestamp.fromDate(start))
    .where('date', '<=', admin.firestore.Timestamp.fromDate(end))
    .orderBy('date', 'asc')
    .get();

  return snap.docs.map(formatWorkoutDoc);
}

async function deleteWorkout(id) {
  await workoutsCollection.doc(id).delete();
  return true;
}

module.exports = {
  getUserByUsername,
  getUserByEmail,
  getUserByUsernameOrEmail,
  createUser,
  addWorkout,
  getWorkoutsByUser,
  getLimitedRecentWorkouts,
  getWorkoutsByUserAndDate,
  deleteWorkout
};

