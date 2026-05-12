console.log("🔥 Firebase Client v1 Initialized");

const firebaseConfig = {
  apiKey: "AIzaSyBlpLfL6ProXUrqhr9FGET7ACfPOKBudSw",
  authDomain: "gen-lang-client-0007945213.firebaseapp.com",
  projectId: "gen-lang-client-0007945213",
  storageBucket: "gen-lang-client-0007945213.firebasestorage.app",
  messagingSenderId: "570021771449",
  appId: "1:570021771449:web:70d9e7e254d4ff7e654368",
  measurementId: "G-HPSWPH0R7Q"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("✅ Firebase Firestore connected");
