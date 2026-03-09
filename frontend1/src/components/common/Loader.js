import React from 'react';

const Loader = ({ size = 'medium', fullScreen = false, text = 'Loading...' }) => {
  const sizes = {
    small: {
      container: '20px',
      border: '2px',
    },
    medium: {
      container: '40px',
      border: '3px',
    },
    large: {
      container: '60px',
      border: '4px',
    },
  };

  const loaderStyle = {
    width: sizes[size].container,
    height: sizes[size].container,
    border: `${sizes[size].border} solid #f3f3f3`,
    borderTop: `${sizes[size].border} solid #007bff`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 9999,
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    minHeight: '200px',
  };

  return (
    <div style={containerStyle}>
      <div style={loaderStyle} />
      {text && <p style={{ marginTop: '15px', color: '#666' }}>{text}</p>}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;