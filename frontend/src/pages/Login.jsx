import { useState } from "react";
import { loginUser } from "../services/authServices";
import { useNavigate } from "react-router-dom";

function Login() {

  const [userId,setUserId] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try{

      const res = await loginUser({
        user_id:userId,
        email:email,
        password:password
      });

      localStorage.setItem("user_id",res.data.user_id);

      alert("OTP Sent");
      navigate("/verify-otp");

    }catch(err){
      alert("Login failed");
    }
  }

  return(

    <div>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>

        <input
          placeholder="User ID"
          value={userId}
          onChange={(e)=>setUserId(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

      </form>

    </div>

  );
}

export default Login;
