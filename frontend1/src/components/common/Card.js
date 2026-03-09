import React from 'react';

const Card = ({ children, title, className = '', style = {}, onClick }) => {
  const cardStyles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '20px',
      maxWidth: '500px',
      width: '100%',
      margin: '0 auto',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ...style,
    },
    title: {
      margin: '0 0 20px 0',
      fontSize: '24px',
      fontWeight: '500',
      textAlign: 'center',
      color: '#333',
      borderBottom: '2px solid #f0f0f0',
      paddingBottom: '10px',
    },
  };

  return (
    <div 
      style={cardStyles.container} 
      className={className}
      onClick={onClick}
      onMouseEnter={onClick ? (e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      } : null}
      onMouseLeave={onClick ? (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      } : null}
    >
      {title && <h2 style={cardStyles.title}>{title}</h2>}
      {children}
    </div>
  );
};

export default Card;