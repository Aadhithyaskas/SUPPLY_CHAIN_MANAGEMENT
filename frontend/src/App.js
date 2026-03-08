import React, { useEffect } from 'react';
import AuthenticationSystem from './components/AuthenticationSystem/AuthenticationSystem';
import './App.css';

function App() {

  useEffect(() => {
    fetch("http://localhost:8000/api/auth/csrf/", {
      method: "GET",
      credentials: "include"
    })
    .then(res => res.json())
    .then(data => console.log("CSRF initialized:", data))
    .catch(err => console.error("CSRF error:", err));
  }, []);

  return (
    <div className="App">
      <AuthenticationSystem />
    </div>
  );
}

export default App;
