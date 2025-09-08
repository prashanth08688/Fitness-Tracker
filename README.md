Fitness Tracker - Project Documentation

Overview  
The Fitness Tracker is a full-stack web application that allows users to track workouts, monitor progress with charts, and analyze fitness data. It includes user authentication, workout management, and data visualization.

Team Roles 
02-coding
06- Jenkins
18-deployment kubernet
33-docker
34-git
42-coding
Le 4-testing

Technical Architecture

Frontend  
- HTML5, CSS3, JavaScript  
- chart.js for visualizations  
- Responsive design for desktop and mobile

Backend  
- Node.js  
- Express.js  
- Firebase Firestore database  
- Firebase Admin SDK

Authentication & Security  
- JWT for authentication  
- bcrypt for password hashing  
- CORS enabled

Project Structure  
fitness-tracker/  
 app.js  
 package.json  
 package-lock.json  
 service-account-key.json  
 auth.js  
 middleware.js  
 firebase.js  
 workout.js  
 index.html  
 login.html  
 signup.html  
 .env

Key Features

1. User Authentication  
- Registration with username, email, password  
- Login with username/email and password  
- JWT session management  
- Secure password storage

2. Workout Management  
- Add workouts with type, duration, automatic calorie calculation  
- View recent workouts  
- Search by date  
- Delete workouts  
- Types: Running, Cycling, Swimming, Weightlifting, Yoga, Jump Rope, Basketball, Tennis, Boxing, Dancing

3. Data Visualization  
- Progress chart for calories burned (last 7 days)  
- Statistics: total workouts, total calories, average per session

4. Responsive Design  
- Mobile-friendly  
- Clean, modern UI

API Endpoints

Authentication Routes (/api/auth)  
- POST /signup – Create user  
- POST /login – Authenticate user

Workout Routes (/api/workouts) – Protected  
- POST / – Create workout  
- GET / – Get user workouts  
- GET /recent – Get recent workouts  
- GET /by-date?date=YYYY-MM-DD – Get workouts by date  
- DELETE /:id – Delete workout

Database Schema

Users Collection  
{ username: string, email: string, password: string, createdAt: timestamp }

Workouts Collection  
{ userId: string, type: string, duration: number, calories: number, date: timestamp, createdAt: timestamp }

Calorie Calculation  
Uses fixed MET values per minute:  
- Running: 8.3  
- Cycling: 7.0  
- Swimming: 6.0  
- Weightlifting: 3.0  
- Yoga: 2.5  
- Jump Rope: 10.0  
- Basketball: 6.0  
- Tennis: 5.0  
- Boxing: 7.0  
- Dancing: 4.5  
Calories = MET × duration

Security Measures  
1. Passwords hashed with bcrypt  
2. JWT tokens expire after 1 hour  
3. Protected routes require valid JWT  
4. Input validation on client and server  
5. CORS configured

Deployment Considerations

Environment Variables  
- JWT_SECRET  
- FIREBASE_PROJECT_ID  
- PORT (default: 3000)

Firebase Setup  
1. Create Firebase project  
2. Enable Firestore  
3. Generate service account key  
4. Save as service-account-key.json

Installation and Running  
npm install  
npm start

Potential Enhancements  
1. Social features  
2. Detailed workout tracking  
3. Wearable device integration  
4. Email notifications  
5. Advanced analytics  
6. Workout plans  
7. Photo uploads

Browser Compatibility  
Works on modern browsers supporting ES6+, HTML5, CSS Flexbox/Grid, Canvas API.

Error Handling  
Includes handling for database, authentication, input, network, and authorization errors.

This Fitness Tracker provides a foundation for tracking workouts and progress, with potential for expansion.

