import React from 'react';
import Button from './Button';

const Table = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true,
  loading = false,
  emptyMessage = 'No data found'
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        color: '#666'
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderRadius: '4px',
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057',
                  fontSize: '14px',
                  ...column.headerStyle,
                }}
              >
                {column.header}
              </th>
            ))}
            {showActions && (
              <th style={{
                padding: '12px',
                textAlign: 'center',
                borderBottom: '2px solid #dee2e6',
                fontWeight: '600',
                color: '#495057',
                fontSize: '14px',
              }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                borderBottom: '1px solid #dee2e6',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    color: '#212529',
                    ...column.cellStyle,
                  }}
                >
                  {column.render
                    ? column.render(row[column.accessor], row)
                    : row[column.accessor]}
                </td>
              ))}
              {showActions && (
                <td style={{
                  padding: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {onView && (
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => onView(row)}
                      >
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="small"
                        variant="outlineDanger"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

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

export default Table;