import React, { useEffect } from 'react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true 
}) => {
  const sizes = {
    small: { width: '400px' },
    medium: { width: '600px' },
    large: { width: '800px' },
    full: { width: '90%', maxWidth: '1200px' },
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          width: sizes[size].width,
          maxWidth: sizes[size].maxWidth || sizes[size].width,
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'modalSlideIn 0.3s ease',
        }}
      >
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: '1px solid #dee2e6',
            }}
          >
            {title && <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  lineHeight: '1',
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>

      <style>
        {`
          @keyframes modalSlideIn {
            from {
              transform: translateY(-30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Modal;