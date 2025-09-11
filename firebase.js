// firebase.js - OPTIMIZED VERSION (use when indexes are ready)
const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require('./service-account-key.json');

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully for GCP Firestore');
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
}

const db = admin.firestore();
const usersCollection = db.collection('users');
const workoutsCollection = db.collection('workouts');

/* ---------------- OPTIMIZED FUNCTIONS (use when indexes are ready) ---------------- */

async function getWorkoutsByUser(userId) {
    try {
        console.log('Fetching workouts with optimized query');
        const snap = await workoutsCollection
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .get();

        const workouts = snap.docs.map(formatWorkoutDoc);
        console.log(`Found ${workouts.length} workouts for user ${userId}`);
        return workouts;
    } catch (error) {
        console.error('Error in getWorkoutsByUser:', error);
        throw error;
    }
}

async function getLimitedRecentWorkouts(userId, limit = 3) {
    try {
        console.log(`Fetching ${limit} recent workouts with optimized query`);
        const snap = await workoutsCollection
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .limit(limit)
            .get();

        const workouts = snap.docs.map(formatWorkoutDoc);
        console.log(`Found ${workouts.length} recent workouts`);
        return workouts;
    } catch (error) {
        console.error('Error in getLimitedRecentWorkouts:', error);
        throw error;
    }
}

async function getWorkoutsByUserAndDate(userId, dateStr) {
    try {
        console.log('Fetching workouts with date range query');
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

        const workouts = snap.docs.map(formatWorkoutDoc);
        console.log(`Found ${workouts.length} workouts for date ${dateStr}`);
        return workouts;
    } catch (error) {
        console.error('Error in getWorkoutsByUserAndDate:', error);
        throw error;
    }
}

// Keep the helper functions the same
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
    try {
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
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await workoutsCollection.add(workoutDoc);
        const saved = await docRef.get();
        return formatWorkoutDoc(saved);
    } catch (error) {
        console.error('Error in addWorkout:', error);
        throw error;
    }
}

async function deleteWorkout(id) {
    try {
        await workoutsCollection.doc(id).delete();
        return true;
    } catch (error) {
        console.error('Error in deleteWorkout:', error);
        throw error;
    }
}

// Export all functions
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
        const byUsername = await module.exports.getUserByUsername(value);
        return byUsername || await module.exports.getUserByEmail(value);
    },
    createUser: async (userObj) => {
        const docRef = await usersCollection.add(userObj);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    },
    addWorkout,
    getWorkoutsByUser,
    getLimitedRecentWorkouts,
    getWorkoutsByUserAndDate,
    deleteWorkout
};