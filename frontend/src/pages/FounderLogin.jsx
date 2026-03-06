import { useState } from "react";
import { founderLogin } from "../services/authServices";
import { useNavigate } from "react-router-dom";

function FounderLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await founderLogin({
        admin_id: adminId,
        password: password,
      });
      navigate("/admin-dashboard");
    } catch (err) {
      alert("Invalid credentials. Please check your Admin ID and Password.");
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
      backgroundColor: "#1a202c", // Darker background for Founder context
      fontFamily: "'Inter', sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "380px",
      padding: "40px",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
      textAlign: "center",
    },
    title: {
      color: "#1a202c",
      fontSize: "22px",
      fontWeight: "700",
      marginBottom: "8px",
    },
    subTitle: {
      color: "#718096",
      fontSize: "14px",
      marginBottom: "25px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      marginBottom: "16px",
      border: "1.5px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "15px",
      boxSizing: "border-box",
      outline: "none",
      transition: "border-color 0.2s",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: loading ? "#4a5568" : "#2d3748", // Darker professional button
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "background-color 0.2s",
      marginTop: "8px",
    },
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Founder Portal</h2>
        <p style={styles.subTitle}>Access the root administration panel</p>

        <input
          style={styles.input}
          placeholder="Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "#2d3748")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "#2d3748")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />

        <button 
          style={styles.button} 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Secure Login"}
        </button>
      </div>
    </div>
  );
}

export default FounderLogin;