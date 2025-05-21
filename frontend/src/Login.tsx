import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 
import Swal from 'sweetalert2';
import {
  login
} from "./service/http/userService";


const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); // เพิ่ม success state
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const { data } = await login(username, password);

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", username); // ✅ เพิ่มบรรทัดนี้

    setError(null);

    await Swal.fire({
      title: 'สำเร็จ!',
      text: 'Login เสร็จแล้ว',
      icon: 'success',
      confirmButtonText: 'ไปต่อ',
      confirmButtonColor: '#3085d6'
    });

    navigate("/");
  } catch (err) {
    console.error(err);
    setError("Invalid username or password.");
  }
};



  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" className="btn-submit">Login</button>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Login เสร็จแล้ว</div>}
      </form>
      {showPopup && (
    <div className="popup-overlay">
    <div className="popup-box">
      <p>Login เสร็จแล้ว</p>
    </div>
  </div>
)}

    </div>
  );
};


export default Login;
