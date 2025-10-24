import React, { useState, useEffect } from "react";
import "./login.css";

interface SignInProps {
  onSignIn: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [email, setEmail] = useState("dummyuser@example.com");
  const [password, setPassword] = useState("password123");

  useEffect(() => {
    setTitleAnimated(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) onSignIn();
  };

  return (
    <div className="signin-container">
      <div className="title-wrapper large-title">
        {[..."BookBuddy"].map((letter, i) => (
          <span
            key={i}
            className={`title-letter ${titleAnimated ? "jump" : ""}`}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="form-box frosted-glass">
        <p className="tagline">Sign in to unlock AI-powered book picks.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="links">
            <a href="#">Forgot Password</a>
          </div>
          <button type="submit" className="signin-btn">
            Sign In
          </button>
        </form>
      </div>

      <footer className="footer">
        <p className="connect-text">Connect with us on:</p>
        <div className="social-links">
          <a href="https://www.instagram.com" target="_blank">Instagram</a>
          <a href="https://www.discord.com" target="_blank">Discord</a>
          <a href="https://www.linkedin.com" target="_blank">LinkedIn</a>
          <a href="https://www.github.com" target="_blank">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;