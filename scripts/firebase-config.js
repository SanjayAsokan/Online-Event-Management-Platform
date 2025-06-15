import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyABfgLYZowmMM1U1HV0XjC3bNhlabRenAI",
  authDomain: "eventmanagementplatform-fa276.firebaseapp.com",
  projectId: "eventmanagementplatform-fa276",
  storageBucket: "eventmanagementplatform-fa276.appspot.com", 
  messagingSenderId: "940355212876",
  appId: "1:940355212876:web:7c2a5d24518ebfbbc886e9",
  measurementId: "G-SV7TS0L7ZW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
