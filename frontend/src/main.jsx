import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Apply theme from localStorage before render to prevent flash
const savedTheme = localStorage.getItem('bankassist-theme');
if (savedTheme === 'dark' || savedTheme === null) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
