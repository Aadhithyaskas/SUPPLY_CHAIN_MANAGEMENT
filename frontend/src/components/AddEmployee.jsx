import { useState } from "react";
import { createEmployee } from "../services/authServices";

function AddEmployee() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("inventory_manager"); // Default value

  const handleSubmit = async () => {
    try {
      await createEmployee({ username, email, role });
      alert("Employee created. Password sent to email");
    } catch {
      alert("Error creating employee");
    }
  };

  // --- Inline CSS Styles ---
  const styles = {
    container: {
      maxWidth: "400px",
      margin: "30px auto",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      backgroundColor: "#ffffff",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      marginTop: "0",
      marginBottom: "20px",
      color: "#333",
      textAlign: "center",
      fontSize: "1.5rem",
    },
    inputField: {
      width: "100%",
      padding: "12px 15px",
      marginBottom: "15px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      boxSizing: "border-box", // Vital for keeping inputs within container width
      outline: "none",
    },
    selectField: {
      width: "100%",
      padding: "12px 15px",
      marginBottom: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "white",
      fontSize: "14px",
      cursor: "pointer",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Add Employee</h3>

      <input
        style={styles.inputField}
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        style={styles.inputField}
        type="email"
        placeholder="Email Address"
        onChange={(e) => setEmail(e.target.value)}
      />

      <label style={{ fontSize: "12px", color: "#666", marginBottom: "5px", display: "block" }}>
        Assign Role
      </label>
      <select 
        style={styles.selectField} 
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="inventory_manager">Inventory Manager</option>
        <option value="quality_assistant">Quality Assistant</option>
        <option value="manager">Manager</option>
        <option value="supervisor">Supervisor</option>
      </select>

      <button 
        style={styles.button} 
        onClick={handleSubmit}
        onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
      >
        Create Account
      </button>
    </div>
  );
}

export default AddEmployee;