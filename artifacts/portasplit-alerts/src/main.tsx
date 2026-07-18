import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// When deployed on Vercel, VITE_API_URL points to the Replit API server.
// In Replit dev/prod the API is co-hosted so no base URL is needed.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) setBaseUrl(apiUrl);

createRoot(document.getElementById('root')!).render(<App />);
