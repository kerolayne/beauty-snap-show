import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

let firebaseApp: FirebaseApp;

// Log das configurações (removendo dados sensíveis)
console.log('Firebase Config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
});

try {
  // Verifica se já existe uma instância do Firebase
  if (!getApps().length) {
    console.log('Inicializando nova instância do Firebase...');
    firebaseApp = initializeApp(firebaseConfig);
    
    // Inicializa Firestore com configurações específicas
    const db = getFirestore(firebaseApp);
    console.log('Firestore inicializado');

    // Inicializa Auth
    const auth = getAuth(firebaseApp);
    console.log('Auth inicializado');
  } else {
    console.log('Usando instância existente do Firebase');
    firebaseApp = getApps()[0];
  }
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
  console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
  throw new Error('Falha ao inicializar o Firebase. Verifique suas credenciais.');
}

// Verifica se as variáveis de ambiente necessárias estão definidas
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID'
];

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    console.error(`Variável de ambiente ${varName} não está definida!`);
    throw new Error(`Configuração do Firebase incompleta: ${varName} não definida`);
  }
});

export default firebaseApp