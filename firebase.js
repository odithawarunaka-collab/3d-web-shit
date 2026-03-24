import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-WY_vQ731f0k_fcCGBPxWmjenNxz0iQ4",
  authDomain: "aleko-5cb62.firebaseapp.com",
  projectId: "aleko-5cb62",
  storageBucket: "aleko-5cb62.firebasestorage.app",
  messagingSenderId: "667088576013",
  appId: "1:667088576013:web:0ef265ed89de465a423f44",
  measurementId: "G-PLEPH2E8KE"
};

const app        = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
};