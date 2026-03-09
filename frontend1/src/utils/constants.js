export const API_BASE_URL = "http://localhost:8000/api";

export const ROLES = {
  ADMIN: 'admin',
  INVENTORY_MANAGER: 'inventory_manager',
  QUALITY_ASSISTANT: 'quality_assistant',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  FOUNDER_ADMIN: 'FOUNDER_ADMIN'
};

export const STORAGE_KEYS = {
  USER_DATA: 'userData',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  LOGIN_MESSAGE_SHOWN: 'loginMessageShown'
};

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_TIME = 60; // seconds

export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};