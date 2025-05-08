// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 


const firebaseConfig = {
  apiKey: "AIzaSyDPJOSZ9KnunNP6MMDhj43RcWDZ1A48kkM",
  authDomain: "signify-6c9b8.firebaseapp.com",
  projectId: "signify-6c9b8",
  storageBucket: "signify-6c9b8.firebasestorage.app",
  messagingSenderId: "307055958247",
  appId: "1:307055958247:web:a4184e162d055d135aaa42",
  measurementId: "G-L0V0MVNYPG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

export { app, db, auth };
