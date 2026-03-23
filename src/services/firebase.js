import { getApp, getApps, initializeApp } from 'firebase/app'
import { getDatabase, onValue, ref, set } from 'firebase/database'

const fallbackFirebaseConfig = {
  apiKey: 'AIzaSyC2euMKW0qlGc8RhB1B5saMqEjYsijmwVg',
  authDomain: 'br-collection-851fc.firebaseapp.com',
  databaseURL: 'https://br-collection-851fc-default-rtdb.firebaseio.com',
  projectId: 'br-collection-851fc',
  storageBucket: 'br-collection-851fc.firebasestorage.app',
  messagingSenderId: '97020310664',
  appId: '1:97020310664:web:06d305fb58966f0b485b3d',
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  databaseURL: (import.meta.env.VITE_FIREBASE_DATABASE_URL || fallbackFirebaseConfig.databaseURL || '').replace(/\/+$/, ''),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
}

const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

let database = null

if (firebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  database = getDatabase(app)
}

export const firebaseState = {
  configured: firebaseConfigured,
  database,
  config: firebaseConfig,
}

export const subscribeToPath = (path, callback) => {
  if (!database) {
    return () => {}
  }

  const dbRef = ref(database, path)
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.val())
  })
}

export const subscribeToConnectionState = (callback) => {
  if (!database) {
    callback(false)
    return () => {}
  }

  const connectedRef = ref(database, '.info/connected')
  return onValue(connectedRef, (snapshot) => {
    callback(Boolean(snapshot.val()))
  })
}

export const writePath = async (path, value) => {
  if (!database) {
    return false
  }

  await set(ref(database, path), value)
  return true
}
