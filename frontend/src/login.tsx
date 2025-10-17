import React, { useState } from "react";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    // TODO: connect to backend API
  };

  return (
    <div className="login-page">
      <h1 className="app-title">BookBuddy</h1>
      <div className="login-box">
        <h2>Sign-in</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />

          <div className="login-links">
            <a href="#">Forgot Password</a>
            <a href="#">Login as Guest</a>
          </div>

          <button type="submit" className="login-button">
            Sign-In
          </button>
        </form>
      </div>

      <footer className="footer">
        <a href="#">Discord          </a>
        <a href="#">LinkedIn         </a>
        <a href="#">Instagram        </a>
        <a href="#">Github            </a>
      </footer>
    </div>
  );
};

export default Login;