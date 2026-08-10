import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDaP4kUdnfXI_nqNYQAQqxG_XumrfssQyc",
  authDomain: "lalys-cosmetics.firebaseapp.com",
  projectId: "lalys-cosmetics",
  storageBucket: "lalys-cosmetics.firebasestorage.app",
  messagingSenderId: "274852477519",
  appId: "1:274852477519:web:7502bca458ab7adb64483a",
  measurementId: "G-B0PC716Z7M"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)