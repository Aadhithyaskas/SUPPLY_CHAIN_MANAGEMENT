import { apiRequest } from './api';

export const createSupplier = (data) =>
  apiRequest('/suppliers/create/', 'POST', data);

export const listSuppliers = () =>
  apiRequest('/suppliers/list/', 'GET');

export const getSupplier = (supplierId) =>
  apiRequest(`/suppliers/${supplierId}/`, 'GET');

export const updateSupplier = (supplierId, data) =>
  apiRequest(`/suppliers/update/${supplierId}/`, 'PUT', data);

export const deleteSupplier = (supplierId) =>
  apiRequest(`/suppliers/delete/${supplierId}/`, 'DELETE');