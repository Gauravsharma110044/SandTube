import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

try {
  const u = JSON.parse(localStorage.getItem('user') || 'null');
  // Google access tokens last about an hour; drop an expired sign-in instead of looking signed in.
  if (u && u.issuedAt && Date.now() - u.issuedAt > 55 * 60 * 1000) localStorage.removeItem('user');
} catch { localStorage.removeItem('user'); }

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
