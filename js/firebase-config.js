// js/firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyDaP4kUdnfXI_nqNYQAQqxG_XumrfssQyc",
  authDomain: "lalys-cosmetics.firebaseapp.com",
  projectId: "lalys-cosmetics",
  storageBucket: "lalys-cosmetics.firebasestorage.app",
  messagingSenderId: "274852477519",
  appId: "1:274852477519:web:7502bca458ab7adb64483a",
  measurementId: "G-B0PC716Z7M"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Instancia de Firestore para usar en todo el proyecto
const db = firebase.firestore();