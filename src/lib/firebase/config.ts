import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace these placeholder values with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBbunJbTqxpiSxTEry3X4DA6_lDqmRg4iM",
    authDomain: "firdb-2025.firebaseapp.com",
    databaseURL: "https://firdb-2025-default-rtdb.firebaseio.com",
    projectId: "firdb-2025",
    storageBucket: "firdb-2025.firebasestorage.app",
    messagingSenderId: "593263815490",
    appId: "1:593263815490:web:84873b7c9bd2fa17dbb6db",
    measurementId: "G-DMGK4CE95Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;