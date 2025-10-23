import * as admin from 'firebase-admin'

// Load service account credentials from environment variable or JSON file
let serviceAccount: admin.ServiceAccount
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Parse from environment variable (useful for production)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
} else {
  // Load from local file (useful for development)
  serviceAccount = require('../../firebase-service-account.json')
}

export function initializeFirebaseAdmin() {
  // Initialize only if it hasn't been initialized already
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    })
  }
}

export const auth = admin.auth()
export const firestore = admin.firestore()