import { useState } from "react";
import { forceChangePassword } from "../services/authServices";
import { useNavigate } from "react-router-dom";

function ForceChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    // Basic Frontend Validation
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await forceChangePassword({
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      alert("Password updated successfully! Please login with your new credentials.");
      navigate("/employee-login");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  // --- Inline CSS Styles ---
  const styles = {
    pageWrapper: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f0f2f5",
      fontFamily: "'Inter', sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "400px",
      padding: "40px",
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      textAlign: "center",
    },
    header: {
      color: "#1a1a1a",
      fontSize: "22px",
      marginBottom: "10px",
    },
    infoText: {
      color: "#666",
      fontSize: "14px",
      marginBottom: "25px",
      lineHeight: "1.5",
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      marginBottom: "15px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "15px",
      boxSizing: "border-box",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: loading ? "#a5c8ff" : "#28a745", // Green for positive action
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      marginTop: "10px",
      transition: "background-color 0.2s",
    },
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.header}>Secure Your Account</h2>
        <p style={styles.infoText}>
          This is your first login. Please choose a new, strong password to continue.
        </p>

        <input
          type="password"
          style={styles.input}
          placeholder="New Password"
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          style={styles.input}
          placeholder="Confirm New Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button 
          style={styles.button} 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

export default ForceChangePassword;