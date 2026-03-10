export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateVendorForm = (values) => {
  const errors = {};
  
  if (!validateRequired(values.vendor_name)) {
    errors.vendor_name = 'Vendor name is required';
  }
  
  if (values.email && !validateEmail(values.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (values.lead_time && values.lead_time < 0) {
    errors.lead_time = 'Lead time cannot be negative';
  }
  
  return errors;
};

export const validateSupplierForm = (values) => {
  const errors = {};
  
  if (!validateRequired(values.supplier_name)) {
    errors.supplier_name = 'Supplier name is required';
  }
  
  if (values.email && !validateEmail(values.email)) {
    errors.email = 'Invalid email format';
  }
  
  return errors;
};

export const validateWarehouseForm = (values) => {
  const errors = {};
  
  if (!validateRequired(values.warehouse_name)) {
    errors.warehouse_name = 'Warehouse name is required';
  }
  
  if (values.warehouse_email && !validateEmail(values.warehouse_email)) {
    errors.warehouse_email = 'Invalid email format';
  }
  
  if (values.warehouse_phone && !validatePhone(values.warehouse_phone)) {
    errors.warehouse_phone = 'Phone number must be 10 digits';
  }
  
  return errors;
};
// Add to existing validators.js

export const validateEmployeeForm = (values) => {
  const errors = {};
  
  if (!values.username || values.username.trim() === '') {
    errors.username = 'Username is required';
  } else if (values.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }
  
  if (!values.f_name || values.f_name.trim() === '') {
    errors.f_name = 'First name is required';
  }
  
  if (!values.l_name || values.l_name.trim() === '') {
    errors.l_name = 'Last name is required';
  }
  
  if (!values.email || values.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!validateEmail(values.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!values.role || values.role === '') {
    errors.role = 'Role is required';
  }
  
  return errors;
};

export const ROLES = [
  { value: 'inventory_manager', label: 'Inventory Manager' },
  { value: 'quality_assistant', label: 'Quality Assistant' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'admin', label: 'Admin' }
];