import { API_BASE_URL } from '../utils/constants';
import { getCookie } from '../utils/helpers';

export const ensureCSRF = async () => {
  if (!getCookie('csrftoken')) {
    await fetch(`${API_BASE_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
  }
};

export const apiRequest = async (endpoint, method = 'GET', data = null, requiresAuth = true) => {
  await ensureCSRF();
  
  const csrftoken = getCookie('csrftoken');
  const accessToken = localStorage.getItem('accessToken');

  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
  };

  if (requiresAuth && accessToken) {
    options.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Handle token refresh
    if (response.status === 401 && requiresAuth) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
          });
          
          if (refreshResponse.ok) {
            const { access } = await refreshResponse.json();
            localStorage.setItem('accessToken', access);
            // Retry the original request
            options.headers['Authorization'] = `Bearer ${access}`;
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const retryResult = await retryResponse.json();
            
            if (!retryResponse.ok) {
              throw new Error(retryResult.error || retryResult.detail || 'Request failed');
            }
            
            return retryResult;
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.detail || 'Request failed');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};