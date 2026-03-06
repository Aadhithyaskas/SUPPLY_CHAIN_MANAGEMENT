import API from "../api/axios";

export const founderLogin = (data) => API.post("auth/founder-login/", data);

export const loginUser = (data) => API.post("auth/login/", data);

export const verifyOTP = (data) => API.post("auth/verify-login-otp/", data);

export const forceChangePassword = (data) =>
  API.post("auth/force-change-password/", data);

export const logout = () => API.post("auth/logout/");

export const getEmployees = () => API.get("auth/list-employees/");

export const createEmployee = (data) =>
  API.post("auth/admin-create-user/", data);

export const updateEmployee = (employee_id, data) =>
  API.put(`auth/update-user/${employee_id}/`, data);

export const deleteEmployee = (employee_id) =>
  API.delete(`auth/delete-user/${employee_id}/`);
