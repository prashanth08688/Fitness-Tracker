// firebase.js - UPDATED TO USE ENV VARIABLES
const admin = require('firebase-admin');
require('dotenv').config();

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
      }),
    });
    console.log("✅ Firebase Admin initialized successfully from environment variables");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  throw error;
}

const db = admin.firestore();
const usersCollection = db.collection('users');
const workoutsCollection = db.collection('workouts');

/* ---------------- HELPER FUNCTIONS ---------------- */
function formatWorkoutDoc(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    type: data.type || '',
    duration: data.duration != null ? Number(data.duration) : null,
    calories: data.calories != null ? Number(data.calories) : null,
    userId: data.userId || null,
    date: data.date && data.date.toDate ? data.date.toDate().toISOString() : (data.date || null),
    createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || null),
  };
}

/* ---------------- USER FUNCTIONS ---------------- */
module.exports = {
  getUserByUsername: async (username) => {
    const snap = await usersCollection.where('username', '==', username).limit(1).get();
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  getUserByEmail: async (email) => {
    const snap = await usersCollection.where('email', '==', email).limit(1).get();
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  getUserByUsernameOrEmail: async (value) => {
    const snap = await usersCollection.where('username', '==', value).limit(1).get();
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

    const snap2 = await usersCollection.where('email', '==', value).limit(1).get();
    return snap2.empty ? null : { id: snap2.docs[0].id, ...snap2.docs[0].data() };
  },

  createUser: async (user) => {
    const docRef = await usersCollection.add(user);
    const saved = await docRef.get();
    return { id: saved.id, ...saved.data() };
  },

  /* ---------------- WORKOUT FUNCTIONS ---------------- */
  getWorkoutsByUser: async (userId) => {
    const snap = await workoutsCollection.where('userId', '==', userId).orderBy('date', 'desc').get();
    return snap.docs.map((doc) => formatWorkoutDoc(doc));
  },

  getLimitedRecentWorkouts: async (userId, limit = 3) => {
    const snap = await workoutsCollection
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((doc) => formatWorkoutDoc(doc));
  },

  getWorkoutsByUserAndDate: async (userId, dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return [];

    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    const end = new Date(y, m - 1, d, 23, 59, 59, 999);

    const snap = await workoutsCollection
      .where('userId', '==', userId)
      .where('date', '>=', admin.firestore.Timestamp.fromDate(start))
      .where('date', '<=', admin.firestore.Timestamp.fromDate(end))
      .orderBy('date', 'asc')
      .get();

    return snap.docs.map((doc) => formatWorkoutDoc(doc));
  },

  addWorkout: async (userId, workoutData) => {
    const adminTS = admin.firestore.Timestamp;
    let dateTS = workoutData.date && !isNaN(Date.parse(workoutData.date))
      ? adminTS.fromDate(new Date(workoutData.date))
      : adminTS.now();

    const workoutDoc = {
      userId,
      type: workoutData.type || '',
      duration: workoutData.duration != null ? Number(workoutData.duration) : null,
      calories: workoutData.calories != null ? Number(workoutData.calories) : null,
      date: dateTS,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await workoutsCollection.add(workoutDoc);
    const saved = await docRef.get();
    return formatWorkoutDoc(saved);
  },

  deleteWorkout: async (id) => {
    await workoutsCollection.doc(id).delete();
    return true;
  },
};
