// Initialize Firebase first
import './lib/firebase'

// Then import the rest of the application
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
