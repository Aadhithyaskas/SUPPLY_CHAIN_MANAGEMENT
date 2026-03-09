import { apiRequest } from './api';

export const createWarehouse = (data) =>
  apiRequest('/vendors/Warehouse/create/', 'POST', data);

export const updateWarehouse = (data) =>
  apiRequest('/vendors/Warehouse/update/', 'PUT', data);

export const getWarehouse = () =>
  apiRequest('/vendors/Warehouse/', 'GET');