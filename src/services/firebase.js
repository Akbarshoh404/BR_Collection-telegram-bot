import { getApp, getApps, initializeApp } from 'firebase/app'
import { doc, getDoc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore'

const fallbackFirebaseConfig = {
  apiKey: 'AIzaSyC2euMKW0qlGc8RhB1B5saMqEjYsijmwVg',
  authDomain: 'br-collection-851fc.firebaseapp.com',
  projectId: 'br-collection-851fc',
  storageBucket: 'br-collection-851fc.firebasestorage.app',
  messagingSenderId: '97020310664',
  appId: '1:97020310664:web:06d305fb58966f0b485b3d',
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
}

const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

let firestore = null

if (firebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  firestore = getFirestore(app)
}

const toDocRef = (path) => {
  if (!firestore || !path) {
    return null
  }

  const segments = path.split('/').filter(Boolean)
  if (segments.length % 2 !== 0) {
    throw new Error(`Firestore document paths need an even number of segments. Received "${path}".`)
  }

  return doc(firestore, ...segments)
}

export const firebaseState = {
  configured: firebaseConfigured,
  firestore,
  config: firebaseConfig,
}

export const subscribeToDoc = (path, callback, onError) => {
  if (!firestore) {
    return () => {}
  }

  const docRef = toDocRef(path)
  return onSnapshot(
    docRef,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null)
    },
    (error) => {
      console.error(`Failed to subscribe to Firestore doc "${path}"`, error)
      onError?.(error)
    },
  )
}

export const readDoc = async (path) => {
  if (!firestore) {
    return null
  }

  const snapshot = await getDoc(toDocRef(path))
  return snapshot.exists() ? snapshot.data() : null
}

export const writeDoc = async (path, value, options = {}) => {
  if (!firestore) {
    return false
  }

  await setDoc(toDocRef(path), value, { merge: Boolean(options.merge) })
  return true
}

