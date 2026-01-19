import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role: UserRole, department?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          department: data.department,
          createdAt: data.createdAt?.toDate() || new Date(),
          photoURL: data.photoURL,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      // Cleanup previous listener if it exists
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = undefined;
      }

      if (user) {
        // Set up real-time listener for user document
        unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              uid: user.uid,
              email: data.email,
              displayName: data.displayName,
              role: data.role,
              department: data.department,
              createdAt: data.createdAt?.toDate() || new Date(),
              photoURL: data.photoURL,
            });
          }
          setLoading(false);
        }, (error) => {
          console.error('Error in user doc listener:', error);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string, role: UserRole, department?: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(user, { displayName });

    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      role,
      department: department || null,
      createdAt: serverTimestamp(),
      photoURL: null,
    });

    await fetchUserData(user.uid);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const isAdmin = userData?.role === 'admin';
  const isTeacher = userData?.role === 'teacher';
  const isStudent = userData?.role === 'student';

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin,
    isTeacher,
    isStudent,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
