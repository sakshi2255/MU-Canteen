# Firebase Configuration & Deployment Guide

This guide details how to connect MU Canteen to a live Google Firebase project.

> [!NOTE]
> If live Firebase credentials are not yet configured, the app runs in **Local Demo Mode** automatically with persistent storage and seed data.

---

## 1. Firebase Console Setup

1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project named `mu-canteen`.
2. Enable **Firebase Authentication**:
   - Provider: **Email/Password**.
3. Create a **Cloud Firestore Database**:
   - Location: `asia-south1` (Mumbai) recommended for Marwadi University, Rajkot.
   - Start in test mode or production mode.

---

## 2. Frontend Configuration

1. In `frontend/`, create `.env` based on `frontend/.env.example`:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=mu-canteen.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mu-canteen
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=mu-canteen.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=1:...:android:...
```

2. Register an Android Application in Firebase Console:
   - Package Name: `com.marwadiuniversity.mucanteen`
   - Download `google-services.json` if building standalone APKs via EAS Build.

---

## 3. Backend Deployment

Deploy Firestore Security Rules, Composite Indexes, and Cloud Functions using the Firebase CLI:

```bash
# Login to Firebase
firebase login

# Set your project
firebase use mu-canteen

# Deploy Firestore rules and composite indexes
firebase deploy --only firestore

# Deploy Cloud Functions
firebase deploy --only functions
```

---

## 4. Local Firebase Emulators (Optional)

You can also run the backend locally using Firebase Local Emulator Suite:

```bash
cd backend
firebase emulators:start
```
- Firestore Emulator: `http://localhost:8080`
- Auth Emulator: `http://localhost:9099`
- Functions Emulator: `http://localhost:5001`
- Emulator UI: `http://localhost:4000`

