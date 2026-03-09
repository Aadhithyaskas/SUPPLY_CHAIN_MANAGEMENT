import { apiRequest } from './api';

export const createVendor = (data) =>
  apiRequest('/vendors/create/', 'POST', data);

export const listVendors = () =>
  apiRequest('/vendors/list_all/', 'GET');

export const getVendor = (vendorId) =>
  apiRequest(`/vendors/${vendorId}/`, 'GET');

export const updateVendor = (vendorId, data) =>
  apiRequest(`/vendors/update/${vendorId}/`, 'PUT', data);

export const deleteVendor = (vendorId) =>
  apiRequest(`/vendors/delete/${vendorId}/`, 'DELETE');