import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey:            "AIzaSyAd07fPQcOrKPhoYKwwBtutHH047ju25Q8",
  authDomain:        "philosophy-library-2026.firebaseapp.com",
  projectId:         "philosophy-library-2026",
  storageBucket:     "philosophy-library-2026.firebasestorage.app",
  messagingSenderId: "886278261145",
  appId:             "1:886278261145:web:44d99e2204bfcfde022b08",
};

const app = initializeApp(firebaseConfig);

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LdV4OwsAAAAAJuXNzOX1ZieUgrCrz9Wk-0y267s"),
  isTokenAutoRefreshEnabled: true,
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
};

export function firebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use":   "This email is already registered. Try signing in.",
    "auth/invalid-email":          "That doesn't look like a valid email.",
    "auth/weak-password":          "Password should be at least 6 characters.",
    "auth/user-not-found":         "No account found with this email.",
    "auth/wrong-password":         "Incorrect password. Try again.",
    "auth/invalid-credential":     "Incorrect email or password.",
    "auth/too-many-requests":      "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user":   "Google sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/user-disabled":          "This account has been disabled.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}