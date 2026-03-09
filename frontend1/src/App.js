import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { WarehouseProvider } from './context/WarehouseContext';
import AppRouter from './routes/AppRouter';
import { ensureCSRF } from './services/api';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize CSRF token
    const initCSRF = async () => {
      try {
        await ensureCSRF();
        console.log('CSRF token initialized');
      } catch (error) {
        console.error('Failed to initialize CSRF:', error);
      }
    };
    
    initCSRF();
  }, []);

  return (
    <AuthProvider>
      <WarehouseProvider>
        <div className="App">
          <AppRouter />
        </div>
      </WarehouseProvider>
    </AuthProvider>
  );
}

export default App;