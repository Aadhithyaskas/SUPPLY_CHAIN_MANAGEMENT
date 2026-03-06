import { useState } from "react";
import { verifyOTP } from "../services/authServices";
import { useNavigate, useLocation } from "react-router-dom";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleVerify = async () => {
    // Try to get user_id from navigation state first, fallback to localStorage
    const user_id = location.state?.user_id || localStorage.getItem("user_id");

    if (!otp) {
      alert("Please enter the OTP sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP({
        user_id,
        otp
      });

      if (res.data.force_change_password) {
        navigate("/force-change-password");
      } else {
        navigate("/employee-dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Invalid or expired OTP. Please try again.");
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
      maxWidth: "360px",
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
    subText: {
      color: "#666",
      fontSize: "14px",
      marginBottom: "25px",
      lineHeight: "1.4",
    },
    input: {
      width: "100%",
      padding: "14px",
      marginBottom: "20px",
      border: "2px solid #e1e4e8",
      borderRadius: "8px",
      fontSize: "18px",
      textAlign: "center",
      letterSpacing: "4px",
      fontWeight: "bold",
      boxSizing: "border-box",
      outline: "none",
      transition: "border-color 0.2s",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: loading ? "#a5c8ff" : "#007bff",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "background-color 0.2s",
    },
    resendLink: {
      marginTop: "20px",
      fontSize: "13px",
      color: "#666",
      display: "block",
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.header}>Two-Factor Auth</h2>
        <p style={styles.subText}>
          Please enter the verification code sent to your registered email address.
        </p>

        <input 
          style={styles.input}
          placeholder="000000"
          maxLength="6"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "#007bff")}
          onBlur={(e) => (e.target.style.borderColor = "#e1e4e8")}
        />

        <button 
          style={styles.button} 
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Confirm & Login"}
        </button>

        <span style={styles.resendLink}>
          Didn't receive a code? <a href="/login" style={{color: "#007bff", textDecoration: "none"}}>Try again</a>
        </span>
      </div>
    </div>
  );
}

export default VerifyOTP;