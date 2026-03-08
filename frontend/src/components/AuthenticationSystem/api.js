const API_BASE_URL = "http://localhost:8000/api/auth";

/* ---------------- GET COOKIE ---------------- */

const getCookie = (name) => {
  const cookies = document.cookie ? document.cookie.split(";") : [];

  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");

    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
};

/* ---------------- ENSURE CSRF TOKEN ---------------- */

const ensureCSRF = async () => {
  if (!getCookie("csrftoken")) {
    await fetch(`${API_BASE_URL}/csrf/`, {
      method: "GET",
      credentials: "include",
    });
  }
};

/* ---------------- API REQUEST WRAPPER ---------------- */

const apiRequest = async (endpoint, method = "GET", data = null) => {
  await ensureCSRF();

  const csrftoken = getCookie("csrftoken");

  const options = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken || "",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.detail || "Request failed");
    }

    return result;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

export default apiRequest;

/* ================= AUTH APIs ================= */

export const login = (employeeId, email, password) =>
  apiRequest("/login/", "POST", {
    employee_id: employeeId,
    email,
    password,
  });

export const verifyOTP = (employeeId, otp) =>
  apiRequest("/verify-login-otp/", "POST", {
    employee_id: employeeId,
    otp,
  });

export const forgotPasswordOTP = (email) =>
  apiRequest("/forgot-password-otp/", "POST", { email });

export const resetPassword = (email, otp, newPassword) =>
  apiRequest("/reset-password/", "POST", {
    email,
    otp,
    new_password: newPassword,
  });

export const forceChangePassword = (newPassword, confirmPassword) =>
  apiRequest("/force-change-password/", "POST", {
    new_password: newPassword,
    confirm_password: confirmPassword,
  });

export const logout = () =>
  apiRequest("/logout/", "POST");

/* ================= ADMIN APIs ================= */

export const adminCreateUser = (userData) =>
  apiRequest("/admin-create-user/", "POST", userData);

export const listEmployees = () =>
  apiRequest("/list_employees/", "GET");

export const updateEmployee = (employeeId, data) =>
  apiRequest(`/update-user/${employeeId}/`, "PUT", data);

export const deleteEmployee = (employeeId) =>
  apiRequest(`/delete-user/${employeeId}/`, "DELETE");
