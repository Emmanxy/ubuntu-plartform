import { initializeApp, getApps, applicationDefault, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../src/types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase Admin SDK
let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

try {
  let credential;
  try {
    credential = applicationDefault();
  } catch {
    // applicationDefault may not be available in local development; fallback to project config
  }

  adminApp = getApps().length > 0 
    ? getApps()[0] 
    : initializeApp({
        projectId: firebaseConfig.projectId,
        ...(credential ? { credential } : {})
      });

  adminAuth = getAuth(adminApp);
  adminDb = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
    : getFirestore(adminApp);
} catch (err) {
  console.error('Failed to initialize Firebase Admin SDK:', err);
}

export { adminApp, adminAuth, adminDb };

export interface FirebaseUserPayload {
  uid: string;
  email?: string;
  name?: string;
  // Compatibility and alias fields for existing handlers
  id: string;
  username: string;
  role: UserRole;
  avatar?: string;
  favorites?: string[];
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: FirebaseUserPayload;
}

/**
 * REPLACED OLD JWT AUTHENTICATION:
 * Middleware to verify Firebase ID tokens passed in Authorization header:
 * 'Authorization: Bearer <firebase_id_token>'
 *
 * Verifies with adminAuth.verifyIdToken() and aligns user with Firestore users/{uid}.
 */
export async function authenticateFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    // Look up user profile from Firestore users/{uid}
    let userProfile: any = null;
    try {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (userDoc.exists) {
        userProfile = userDoc.data();
      }
    } catch (dbErr) {
      console.warn(`Warning: Could not fetch Firestore profile for uid ${uid}:`, dbErr);
    }

    const email = decoded.email || userProfile?.email || '';
    const name = userProfile?.username || decoded.name || (email ? email.split('@')[0] : 'Player');

    // Resolve user role from Firestore, with admin privilege for owner email
    let role: UserRole = (userProfile?.role as UserRole) || 'player';
    if (email === 'takiecbu6@gmail.com') {
      role = 'admin';
    }

    req.user = {
      uid,
      id: uid,
      email,
      name,
      username: name,
      role,
      avatar: userProfile?.avatar || decoded.picture,
      favorites: userProfile?.favorites || []
    };

    next();
  } catch (err: any) {
    console.error('Firebase token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired Firebase authentication token. Please log in again.' });
  }
}

/**
 * REPLACED OLD JWT OPTIONAL AUTH:
 * Optional Firebase Auth middleware:
 * If a valid Bearer token is provided, attaches decoded user to req.user.
 * Otherwise, proceeds anonymously.
 */
export async function optionalFirebaseAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    let userProfile: any = null;
    try {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (userDoc.exists) {
        userProfile = userDoc.data();
      }
    } catch {
      // ignore
    }

    const email = decoded.email || userProfile?.email || '';
    const name = userProfile?.username || decoded.name || (email ? email.split('@')[0] : 'Player');

    let role: UserRole = (userProfile?.role as UserRole) || 'player';
    if (email === 'takiecbu6@gmail.com') {
      role = 'admin';
    }

    req.user = {
      uid,
      id: uid,
      email,
      name,
      username: name,
      role,
      avatar: userProfile?.avatar || decoded.picture,
      favorites: userProfile?.favorites || []
    };
  } catch {
    // Optional token validation error is ignored
  }

  next();
}

/**
 * Role-based access control guard based on req.user.role
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Permission denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
}
