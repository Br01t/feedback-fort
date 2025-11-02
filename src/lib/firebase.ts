import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBr90HzcouZBhmXcoosVzFTZbJlm-5dY7k",
  authDomain: "compilator-44c67.firebaseapp.com",
  projectId: "compilator-44c67",
  storageBucket: "compilator-44c67.firebasestorage.app",
  messagingSenderId: "987887379281",
  appId: "1:987887379281:web:9afa8b4c302b454d8be970",
  measurementId: "G-KLN6XF72T9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
