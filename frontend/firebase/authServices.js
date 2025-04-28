import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore"; 
import { auth, db } from "./fbConfig";

// Sign up new users and store details in Firestore with progress tracking
export const signUp = async (email, password, firstName, lastName) => {
  try {
    // 1. Create auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Send verification email
    await sendEmailVerification(user);

    // 3. Create user document with progress tracking
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      email,
      displayName: `${firstName} ${lastName}`,
      createdAt: new Date(),
      progress: {
        points: 0,
        completedLessons: [],
        completedUnits: [],
        streak: 0,
        streakFreeze: false,
        lastLoginDate: null,
        badges: [],
        lastActive: new Date()
      }
    });

    return user;
  } catch (error) {
    // Enhanced error handling
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    }
    throw new Error(errorMessage);
  }
};

// Sign in user with email verification check
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error("Please verify your email before signing in.");
    }

    // Update last active timestamp
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      'progress.lastActive': new Date()
    });

    return user;
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    }
    throw new Error(errorMessage);
  }
};

// Sign out function
export const signOutUser = async () => {
  try {
    // Update last active timestamp before signing out
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        'progress.lastActive': new Date()
      });
    }
    
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Get current authenticated user with Firestore data
export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  return { ...user, ...userDoc.data() };
};

// Listen for auth state changes with Firestore data
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        callback({ ...user, ...userDoc.data() });
      } catch (error) {
        console.error("Error fetching user data:", error);
        callback(user); // Fallback to basic user data
      }
    } else {
      callback(null);
    }
  });
};

// Reset password function
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    }
    throw new Error(errorMessage);
  }
};

// Delete account function with progress data cleanup
export const deleteAccount = async (email, password) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    // Reauthenticate
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);

    // Delete user document (including progress data)
    await deleteDoc(doc(db, "users", user.uid));

    // Delete auth account
    await deleteUser(user);

    return true;
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Account not deleted.';
    }
    throw new Error(errorMessage);
  }
};

export default auth;