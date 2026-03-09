import React, { useEffect } from 'react';
import { ALERT_TYPES } from '../../utils/constants';

const Alert = ({ type, message, onClose, autoClose = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getAlertStyles = () => {
    const baseStyles = {
      padding: '12px 20px',
      borderRadius: '4px',
      marginBottom: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    };

    switch (type) {
      case ALERT_TYPES.SUCCESS:
        return {
          ...baseStyles,
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        };
      case ALERT_TYPES.ERROR:
        return {
          ...baseStyles,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        };
      case ALERT_TYPES.WARNING:
        return {
          ...baseStyles,
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba'
        };
      case ALERT_TYPES.INFO:
      default:
        return {
          ...baseStyles,
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb'
        };
    }
  };

  return (
    <div style={getAlertStyles()}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'inherit',
            padding: '0 5px'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;