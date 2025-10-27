// Configura aquí tus credenciales reales de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Suprimir warnings de deprecación de Firebase
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  // Filtrar warnings específicos de Firebase
  if (message.includes('@firebase/firestore') || 
      message.includes('enableIndexedDbPersistence') ||
      message.includes('deprecated')) {
    return;
  }
  originalWarn.apply(console, args);
};

const firebaseConfig = {
  apiKey: "AIzaSyAWwN7IbTImrGE5r2lVySfX5-zcVB6Uczs",
  authDomain: "comparacion-281ec.firebaseapp.com",
  projectId: "comparacion-281ec",
  storageBucket: "comparacion-281ec.firebasestorage.app",
  messagingSenderId: "971777675279",
  appId: "1:971777675279:web:9f9df961ddd7202082537a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
