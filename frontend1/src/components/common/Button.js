import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = {
    padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
    fontWeight: '500',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.3s ease',
  };

  const variants = {
    primary: {
      backgroundColor: '#007bff',
      color: 'white',
      '&:hover': {
        backgroundColor: '#0056b3',
      }
    },
    secondary: {
      backgroundColor: '#6c757d',
      color: 'white',
    },
    danger: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
    success: {
      backgroundColor: '#28a745',
      color: 'white',
    },
    warning: {
      backgroundColor: '#ffc107',
      color: 'black',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid #007bff',
      color: '#007bff',
    },
    outlineDanger: {
      backgroundColor: 'transparent',
      border: '1px solid #dc3545',
      color: '#dc3545',
    },
  };

  const style = { ...baseStyles, ...variants[variant] };

  return (
    <button
      type={type}
      style={style}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading...
        </span>
      ) : children}
    </button>
  );
};

export default Button;