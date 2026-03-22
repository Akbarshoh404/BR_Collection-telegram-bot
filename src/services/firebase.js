import { getApp, getApps, initializeApp } from 'firebase/app'
import { getDatabase, onValue, ref, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

export const writePath = async (path, value) => {
  if (!database) {
    return false
  }

  await set(ref(database, path), value)
  return true
}

