import { API_BASE_URL } from '../components/utils/constants';
import { getCookie } from '../components/utils/helpers';

/* ================= CSRF ================= */
export const ensureCSRF = async () => {
  if (!getCookie('csrftoken')) {
    await fetch(`${API_BASE_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
  }
};

/* ================= BASE API ================= */
export const apiRequest = async (endpoint, method = 'GET', data = null) => {
  await ensureCSRF();

  const csrftoken = getCookie('csrftoken');

  const options = {
    method,
    credentials: 'include',
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

/* ================= AUTH ================= */
export const login = (employeeId, email, password, adminId) =>
  apiRequest('/auth/login/', 'POST', {
    employee_id: employeeId,
    email,
    password,
    admin_id: adminId,
  });

export const verifyOTP = (otp) =>
  apiRequest('/auth/verify-login-otp/', 'POST', { otp });

export const forgotPasswordOTP = (email) =>
  apiRequest('/auth/forgot-password-otp/', 'POST', { email });

export const resetPassword = (email, otp, newPassword) =>
  apiRequest('/auth/reset-password/', 'POST', {
    email,
    otp,
    new_password: newPassword,
  });

export const forceChangePassword = (newPassword, confirmPassword) =>
  apiRequest('/auth/force-change-password/', 'POST', {
    new_password: newPassword,
    confirm_password: confirmPassword,
  });

export const logout = () => apiRequest('/auth/logout/', 'POST');

/* ================= EMPLOYEE ================= */
export const adminCreateUser = (data) =>
  apiRequest('/auth/admin-create-user/', 'POST', data);

export const listEmployees = () =>
  apiRequest('/auth/list_employees/', 'GET');

export const updateEmployee = (employeeId, data) =>
  apiRequest(`/auth/update-user/${employeeId}/`, 'PUT', data);

export const deleteEmployee = (employeeId) =>
  apiRequest(`/auth/delete-user/${employeeId}/`, 'DELETE');

/* ================= SUPPLIER ================= */
export const createSupplier = (data) =>
  apiRequest('/suppliers/create/', 'POST', data);

export const listSuppliers = () =>
  apiRequest('/suppliers/list/', 'GET');

export const getSupplier = (id) =>
  apiRequest(`/suppliers/${id}/`, 'GET');

export const updateSupplier = (id, data) =>
  apiRequest(`/suppliers/update/${id}/`, 'PUT', data);

export const deleteSupplier = (id) =>
  apiRequest(`/suppliers/delete/${id}/`, 'DELETE');

export const restoreSupplier = (id) =>
  apiRequest(`/suppliers/restore/${id}/`, 'PUT');

export const listInactiveSuppliers = () =>
  apiRequest('/suppliers/inactive/', 'GET');

/* ================= VENDOR ================= */
export const createVendor = (data) =>
  apiRequest('/vendors/create/', 'POST', data);

export const listVendors = () =>
  apiRequest('/vendors/list_all/', 'GET');

export const getVendor = (id) =>
  apiRequest(`/vendors/${id}/`, 'GET');

export const updateVendor = (id, data) =>
  apiRequest(`/vendors/update/${id}/`, 'PUT', data);

export const deleteVendor = (id) =>
  apiRequest(`/vendors/delete/${id}/`, 'DELETE');

/* ================= WAREHOUSE ================= */
export const createWarehouse = (data) =>
  apiRequest('/vendors/Warehouse/create/', 'POST', data);

export const updateWarehouse = (data) =>
  apiRequest('/vendors/Warehouse/update/', 'PUT', data);

export const getWarehouse = () =>
  apiRequest('/vendors/warehouse/', 'GET');

/* ================= PRODUCT ================= */
export const createProduct = (data) =>
  apiRequest('/products/create/', 'POST', data);

export const listProducts = () =>
  apiRequest('/products/listall/', 'GET');

export const getProduct = (id) =>
  apiRequest(`/products/list/${id}/`, 'GET');

export const updateProduct = (id, data) =>
  apiRequest(`/products/update/${id}/`, 'PUT', data);

export const deleteProduct = (id) =>
  apiRequest(`/products/delete/${id}/`, 'DELETE');

/* ================= INVENTORY ================= */
export const createInventory = (data) =>
  apiRequest('/inventory/create/', 'POST', data);

export const listInventory = () =>
  apiRequest('/inventory/list/', 'GET');

export const getInventoryLocation = (id) =>
  apiRequest(`/inventory/${id}/`, 'GET');

export const addStock = (productId, quantity) =>
  apiRequest(`/inventory/add-stock/${productId}/`, 'POST', { quantity });

export const removeStock = (productId, quantity) =>
  apiRequest(`/inventory/remove-stock/${productId}/`, 'POST', { quantity });

export const getProductStock = (productId) =>
  apiRequest(`/inventory/product-stock/${productId}/`, 'GET');

/* ================= PURCHASE ================= */
export const listPurchaseRequests = () =>
  apiRequest('/inventory/purchase-requests/', 'GET');

export const createPurchaseRequest = (data) =>
  apiRequest('/inventory/purchase-requests/', 'POST', data);

export const getPurchaseRequest = (id) =>
  apiRequest(`/inventory/purchase-requests/${id}/`, 'GET');

export const managerApprovePR = (prId) =>
  apiRequest(`/inventory/pr/manager-approve/${prId}/`, 'POST');

export const financeApprovePR = (prId) =>
  apiRequest(`/inventory/pr/finance-approve/${prId}/`, 'POST');

export const listPurchaseOrders = () =>
  apiRequest('/inventory/purchase-orders/', 'GET');

export const getPurchaseOrder = (id) =>
  apiRequest(`/inventory/purchase-orders/${id}/`, 'GET');

/* ================= ASN ================= */
export const createASN = (data) =>
  apiRequest('/inventory/create-asn/', 'POST', data);

export const listASN = () =>
  apiRequest('/inventory/asn-list/', 'GET');

export const getASN = (id) =>
  apiRequest(`/inventory/asn/${id}/`, 'GET');

export const updateASN = (id, data) =>
  apiRequest(`/inventory/asn/${id}/`, 'PUT', data);

export const deleteASN = (id) =>
  apiRequest(`/inventory/asn/${id}/`, 'DELETE');

export const createASNItems = (data) =>
  apiRequest('/inventory/create-asn-item/', 'POST', data);

export const listASNItems = () =>
  apiRequest('/inventory/asn-item/', 'GET');

export const getASNItem = (id) =>
  apiRequest(`/inventory/asn-item/${id}/`, 'GET');

/* ================= GRN ================= */
export const createGRN = (data) =>
  apiRequest('/inventory/create-grn/', 'POST', data);

export const createGRNBySupervisor = (data) =>
  apiRequest('/inventory/grn/supervisor-create/', 'POST', data);

export const listGRNs = () =>
  apiRequest('/inventory/grn-list/', 'GET');

export const getGRN = (id) =>
  apiRequest(`/inventory/grn/${id}/`, 'GET');

export const getGRNItems = (id) =>
  apiRequest(`/inventory/grn/${id}/items/`, 'GET');

export const createGRNItems = (data) =>
  apiRequest('/inventory/create-grn-items/', 'POST', data);

export const updateGRNItem = (id, data) =>
  apiRequest(`/inventory/grn-item/${id}/`, 'PUT', data);

export const approveGRN = (id) =>
  apiRequest(`/inventory/grn/qc-approve/${id}/`, 'POST');

export const getQCPendingGRNs = () =>
  apiRequest('/inventory/grn/qc-pending/', 'GET');

export const getMyGRNs = () =>
  apiRequest('/inventory/grn/my-grns/', 'GET');

export const getGRNSummary = (id) =>
  apiRequest(`/inventory/grn/${id}/summary/`, 'GET');

/* ================= REPORTS ================= */
export const getInventoryReport = () =>
  apiRequest('/reports/inventory/', 'GET');

export const getPurchaseReport = (startDate, endDate) =>
  apiRequest(`/reports/purchases/?start=${startDate}&end=${endDate}`, 'GET');