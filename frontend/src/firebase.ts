import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCDn5QqBJ4TeUNlCa6K7-L7JWm316jBvkc",
    authDomain: "my-calculator-c096c.firebaseapp.com",
    databaseURL: "https://my-calculator-c096c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "my-calculator-c096c",
    storageBucket: "my-calculator-c096c.firebasestorage.app",
    messagingSenderId: "1002095565016",
    appId: "1:1002095565016:web:dfc64658f311cd17131fad",
    measurementId: "G-3JBTMM91T8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export default app;
