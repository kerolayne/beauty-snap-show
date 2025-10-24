import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

async function testFirebaseConnection() {
  try {
    console.log('Configuração do Firebase:', {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    });

    // Inicializa o Firebase
    const app = initializeApp(firebaseConfig);
    console.log('Firebase App inicializado');

    // Inicializa o Firestore
    const db = getFirestore(app);
    console.log('Firestore inicializado');

    // Testa a conexão tentando ler a coleção de serviços
    console.log('Tentando ler a coleção de serviços...');
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    console.log('Número de serviços encontrados:', servicesSnapshot.size);

    // Testa a conexão tentando ler a coleção de profissionais
    console.log('Tentando ler a coleção de profissionais...');
    const professionalsSnapshot = await getDocs(collection(db, 'professionals'));
    console.log('Número de profissionais encontrados:', professionalsSnapshot.size);

  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    if (error.message) {
      console.error('Mensagem do erro:', error.message);
    }
  }
}

testFirebaseConnection();