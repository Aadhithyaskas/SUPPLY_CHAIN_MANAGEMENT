import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './common/Navbar';

const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;