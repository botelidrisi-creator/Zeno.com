import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence,
  browserSessionPersistence,
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  getDoc,
  collection,
  getDocs,
  Firestore 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const anyErr = error as any;
  const errorCode = anyErr?.code || (error instanceof Error ? error.name : 'firestore/error');
  const errorMessage = anyErr?.message || (error instanceof Error ? error.message : String(error));
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  const errObj: any = new Error(JSON.stringify(errInfo));
  errObj.code = errorCode;
  errObj.message = errorMessage;
  errObj.firestoreInfo = errInfo;
  throw errObj;
}

// Configuration loaded strictly from firebase-applet-config.json, ignoring any VITE_FIREBASE environment variables
export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId,
};

const apps = getApps();
export const app: FirebaseApp = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId if provided in config
export const db: Firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);

// Enforce browserSessionPersistence: admin must log in again each time the site is opened in a new tab or session
setPersistence(auth, browserSessionPersistence).catch((err) => {
  console.warn('Notice setting browserSessionPersistence:', err);
});

export { browserSessionPersistence, setPersistence };
export const googleProvider = new GoogleAuthProvider();

// Check if user is authorized admin
export const PRIMARY_ADMIN_EMAIL = 'animeanime9683@gmail.com';

export function isUserAuthorizedAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase();
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Any other error means at least server responded
    return true;
  }
}

// Run initial connection test
testConnection().catch(() => {});
