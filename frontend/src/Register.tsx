import React, { useState } from "react";
import "./Register.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate
import { registerUser } from "./service/http/userService";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // ประกาศ navigate

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await registerUser({ username, password });
      setError(null);
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      // ✅ แสดง popup และนำกลับหน้า Login
      await Swal.fire({
        title: "สมัครสมาชิกสำเร็จ!",
        text: "คุณสามารถเข้าสู่ระบบได้แล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085d6",
      });

      navigate("/login"); // กลับไปหน้า Login
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister} className="register-form">
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" className="btn-submit">Register</button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Register;
