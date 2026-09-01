import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  auth, 
  db, 
  googleProvider, 
  appleProvider,
  handleFirestoreError,
  OperationType 
} from '../lib/firebase';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; role?: UserRole; bio?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (gameId: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  // Auth modal state
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot') => void;
  authNotice: string;
  setAuthNotice: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [authNotice, setAuthNotice] = useState('');

  // Fetch or create user document in Firestore
  const syncUserProfile = async (fbUser: FirebaseUser, fallbackUsername?: string, initialRole?: UserRole) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as User;
        setUser({
          ...data,
          id: fbUser.uid,
          email: fbUser.email || data.email || '',
          username: data.username || fbUser.displayName || 'Player',
          role: data.role || 'player',
          isVerified: true,
          favorites: data.favorites || []
        });
      } else {
        // Create initial profile in Firestore
        const newUser: User = {
          id: fbUser.uid,
          email: fbUser.email || '',
          username: fallbackUsername || fbUser.displayName || fbUser.email?.split('@')[0] || 'UbuntuPlayer',
          role: initialRole || 'player',
          isVerified: true,
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          createdAt: new Date().toISOString(),
          favorites: []
        };
        await setDoc(userRef, newUser);
        setUser(newUser);
      }
    } catch (err) {
      console.error('Error syncing user profile with Firestore:', err);
      // Fallback local user object
      setUser({
        id: fbUser.uid,
        email: fbUser.email || '',
        username: fallbackUsername || fbUser.displayName || fbUser.email?.split('@')[0] || 'UbuntuPlayer',
        role: initialRole || 'player',
        isVerified: true,
        avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
        createdAt: new Date().toISOString(),
        favorites: []
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncUserProfile(fbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setAuthNotice('');
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await syncUserProfile(userCredential.user);
    setAuthModalOpen(false);
  };

  const register = async (data: { email: string; username: string; password: string; role?: UserRole; bio?: string }) => {
    setAuthNotice('');
    const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
    
    // Update Firebase Auth profile display name
    await updateFirebaseProfile(userCredential.user, {
      displayName: data.username.trim()
    });

    // Create Firestore document
    const userRef = doc(db, 'users', userCredential.user.uid);
    const newUser: User = {
      id: userCredential.user.uid,
      email: data.email.trim(),
      username: data.username.trim(),
      role: data.role || 'player',
      bio: data.bio || '',
      isVerified: true,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userCredential.user.uid}`,
      createdAt: new Date().toISOString(),
      favorites: []
    };
    
    try {
      await setDoc(userRef, newUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${userCredential.user.uid}`);
    }

    setUser(newUser);
    setAuthModalOpen(false);
  };

  const signInWithGoogle = async () => {
    setAuthNotice('');
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    setAuthModalOpen(false);
  };

  const signInWithApple = async () => {
    setAuthNotice('');
    const result = await signInWithPopup(auth, appleProvider);
    await syncUserProfile(result.user);
    setAuthModalOpen(false);
  };

  const forgotPassword = async (email: string) => {
    setAuthNotice('');
    await sendPasswordResetEmail(auth, email.trim());
    setAuthNotice('Password reset link sent to your email.');
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const toggleFavorite = async (gameId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const currentFavorites = user.favorites || [];
    const isFav = currentFavorites.includes(gameId);
    const newFavorites = isFav 
      ? currentFavorites.filter(id => id !== gameId)
      : [...currentFavorites, gameId];

    const updatedUser = { ...user, favorites: newFavorites };
    setUser(updatedUser);

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { favorites: newFavorites });
    } catch (err) {
      console.warn('Could not persist favorite update to Firestore:', err);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        register,
        signInWithGoogle,
        signInWithApple,
        forgotPassword,
        logout,
        toggleFavorite,
        updateUserProfile,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        authNotice,
        setAuthNotice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
