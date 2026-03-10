import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <Card title="✅ Login Successful!">
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>
          🎉
        </div>
        
        <h2 style={{ color: '#28a745', marginBottom: '15px' }}>
          Welcome Back!
        </h2>
        
        <p style={{ fontSize: '16px', marginBottom: '20px', color: '#666' }}>
          You have successfully logged in to the Warehouse Management System.
        </p>
        
        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '15px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '5px 0', color: '#004085' }}>
            <strong>✨ What's Next?</strong>
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            • View and manage vendors
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            • Manage suppliers
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            • Access warehouse dashboard
          </p>
        </div>
        
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Redirecting to dashboard in <strong>{countdown}</strong> seconds...
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LoginSuccess;