const admin = require('firebase-admin')
const serviceAccount = require('./firebase-service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function testConnection() {
  try {
    // Tenta acessar uma coleção
    const snapshot = await db.collection('users').limit(1).get()
    console.log('Conexão com Firestore bem sucedida!')
    console.log('Documentos encontrados:', snapshot.size)
  } catch (error) {
    console.error('Erro ao conectar com Firestore:', error)
  }
}

testConnection()