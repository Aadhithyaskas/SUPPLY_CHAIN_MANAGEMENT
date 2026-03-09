import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  maxLength,
  ...props
}) => {
  const inputId = `input-${name}-${Math.random().toString(36).substr(2, 9)}`;

  const styles = {
    container: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      fontSize: '14px',
      color: '#333',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${error && touched ? '#dc3545' : '#ced4da'}`,
      borderRadius: '4px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
      boxSizing: 'border-box',
    },
    error: {
      color: '#dc3545',
      fontSize: '12px',
      marginTop: '5px',
    },
    required: {
      color: '#dc3545',
      marginLeft: '2px',
    },
  };

  const inputStyles = { ...styles.input };
  if (!error && touched) {
    inputStyles.borderColor = '#28a745';
  }

  return (
    <div style={styles.container} className={className}>
      {label && (
        <label htmlFor={inputId} style={styles.label}>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={inputStyles}
        maxLength={maxLength}
        {...props}
      />
      {error && touched && <div style={styles.error}>{error}</div>}
    </div>
  );
};

export default Input;