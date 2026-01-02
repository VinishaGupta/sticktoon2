// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAaVYhgDzzPBHsIAdQJaJUMJEYcHnXrbE0",
  authDomain: "sticktoon-4bcfb.firebaseapp.com",
  projectId: "sticktoon-4bcfb",
  storageBucket: "sticktoon-4bcfb.firebasestorage.app",
  messagingSenderId: "827062141536",
  appId: "1:827062141536:web:df063b42cfd4c0558e7905"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ ADD THESE EXPORTS
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
