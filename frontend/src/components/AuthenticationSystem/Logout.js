import React from 'react';

const Logout = ({ onLogout }) => {
  return (
    <div className="logout-container" style={{ marginTop: '20px', textAlign: 'center' }}>
      <button onClick={onLogout} style={{ backgroundColor: '#dc3545' }}>
        Logout
      </button>
    </div>
  );
};

export default Logout;