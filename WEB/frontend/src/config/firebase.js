import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPJOSZ9KnunNP6MMDhj43RcWDZ1A48kkM",
    authDomain: "signify-6c9b8.firebaseapp.com",
    projectId: "signify-6c9b8",
    storageBucket: "signify-6c9b8.firebasestorage.app",
    messagingSenderId: "307055958247",
    appId: "1:307055958247:web:a4184e162d055d135aaa42",
    measurementId: "G-L0V0MVNYPG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { auth, db, analytics, storage }; 