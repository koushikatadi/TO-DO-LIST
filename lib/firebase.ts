import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAToLnScrP6ENMYNkFlJ3gy6k109Q4HwkE",
  authDomain: "discipline-tracker-8cce5.firebaseapp.com",
  projectId: "discipline-tracker-8cce5",
  storageBucket: "discipline-tracker-8cce5.firebasestorage.app",
  messagingSenderId: "936670765393",
  appId: "1:936670765393:web:9d5ae53f0fd0389b8b3370"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
