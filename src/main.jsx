import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';
import { UserRightsProvider } from './context/UserRightsContext';

 createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <AuthProvider>
        <UserRightsProvider> {/* ADD THIS WRAPPER */}
          <App />
        </UserRightsProvider> {/* ADD CLOSING TAG */}
      </AuthProvider>
    </React.StrictMode>
  );

