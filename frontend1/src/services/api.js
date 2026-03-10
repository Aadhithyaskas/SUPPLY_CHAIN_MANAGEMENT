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

export const apiRequest = async (
  endpoint,
  method = 'GET',
  data = null
) => {

  await ensureCSRF();

  const csrftoken = getCookie('csrftoken');

  const options = {
    method,
    credentials: 'include', // VERY IMPORTANT
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

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
