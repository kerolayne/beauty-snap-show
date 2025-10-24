import * as admin from 'firebase-admin'

// Load service account credentials from environment variable or JSON file
let serviceAccount: admin.ServiceAccount
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse from environment variable (useful for production)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  } else {
    try {
      // Load from local file (useful for development)
      serviceAccount = require('../../firebase-service-account.json')
    } catch (error) {
      throw new Error('firebase-service-account.json não encontrado. Por favor, configure as credenciais do Firebase Admin.')
    }
  }
} catch (error) {
  console.error('Erro ao carregar credenciais do Firebase Admin:', error)
  throw new Error('Falha ao carregar credenciais do Firebase Admin. Verifique sua configuração.')

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