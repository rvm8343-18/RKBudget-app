import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBZEi8tFa9sISeqKeuCvl2QUC4sMrC9Uwg",
    authDomain: "rkba2026.firebaseapp.com",
    projectId: "rkba2026",
    storageBucket: "rkba2026.firebasestorage.app",
    messagingSenderId: "617227594023",
    appId: "1:617227594023:web:62b479559bf78c3d8ca102"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

setPersistence(auth, browserSessionPersistence);