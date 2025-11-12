import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import PrimaryButton from "../components/PrimaryButton";
import * as api from "../services/api";
import { useBooks } from "../context/BooksContext";
import "../css/Auth.css";

export default function Auth() {
  const navigate = useNavigate();
  const { updateProfile } = useBooks();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userData = await api.login(email, password);
      // Update user profile with the response data (or dummy guest account)
      updateProfile({
        email: userData.email || email,
        firstName: userData.firstName || "Guest",
        lastName: userData.lastName || "User",
        birthDate: userData.birthDate || new Date().toISOString().split("T")[0],
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          (userData.firstName || "Guest") + " " + (userData.lastName || "User")
        )}&background=0742BF&color=fff&size=200`,
      });
      navigate("/genres");
    } catch (error) {
      if (!email.includes("@")) {
        setError(
          `Please include an '@' in the email address. '${email}' is missing an '@'.`
        );
      } else {
        setError("Invalid email or password.");
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userData = await api.signup({
        email,
        password,
        firstName,
        lastName,
      });
      // Update user profile with the response data (or dummy guest account)
      updateProfile({
        email: userData.email || email,
        firstName: userData.firstName || firstName || "Guest",
        lastName: userData.lastName || lastName || "User",
        birthDate: userData.birthDate || birthDate || new Date().toISOString().split("T")[0],
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          (userData.firstName || firstName || "Guest") + " " + (userData.lastName || lastName || "User")
        )}&background=0742BF&color=fff&size=200`,
      });
      navigate("/genres");
    } catch (error) {
      setError("Failed to create account. Please try again.");
    }
  };

  const handleContinueAsGuest = () => {
    // Create a guest account directly
    const guestFirstName = firstName || "Guest";
    const guestLastName = lastName || "User";
    const guestEmail = email || "guest@bookbuddy.com";
    
    updateProfile({
      email: guestEmail,
      firstName: guestFirstName,
      lastName: guestLastName,
      birthDate: birthDate || new Date().toISOString().split("T")[0],
      profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        guestFirstName + " " + guestLastName
      )}&background=0742BF&color=fff&size=200`,
    });
    navigate("/genres");
  };

  return (
    <div className="page-container">
      <div
        className={
          mode === "login" ? "auth-page-container" : "signup-page-container"
        }
      >
        <AuthLayout
          title="BookBuddy"
          subtitle={
            mode === "login"
              ? "Your reading companion"
              : "Join your reading community"
          }
        />

        <div className="auth-card">
          <h2 className="auth-card-heading">
            {mode === "login" ? "Welcome back" : "Create Account"}
          </h2>

          {mode === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-form-group">
                <div
                  className={
                    error && email
                      ? "input-group input-group-error"
                      : "input-group"
                  }
                >
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                  />
                </div>
                {error && email && (
                  <div className="auth-error-message">
                    <span className="auth-error-icon">⚠</span>
                    <span className="auth-error-text">{error}</span>
                  </div>
                )}
              </div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
              <PrimaryButton type="submit">Sign in</PrimaryButton>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignup}>
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="auth-form-row">
                <div className="auth-form-group-half">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="auth-form-group-half">
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Appleseed"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <Input
                label="Birth Date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <PrimaryButton type="submit">Create Account</PrimaryButton>
            </form>
          )}

          <p className="auth-switch">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setMode("signup")}
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setMode("login")}
                >
                  Sign In
                </button>
              </>
            )}
          </p>

          {mode === "signup" && (
            <p className="auth-guest-link">
              <button
                type="button"
                className="auth-link"
                onClick={handleContinueAsGuest}
              >
                Continue as Guest
              </button>
            </p>
          )}

          {mode === "login" && (
            <>
              <div className="auth-separator"></div>
              <div className="auth-features">
                <p className="auth-features-title">What you'll get:</p>
                <ul className="auth-features-list">
                  <li className="auth-feature-item">
                    <span className="auth-feature-check">✓</span>
                    <span>Personalized book recommendations</span>
                  </li>
                  <li className="auth-feature-item">
                    <span className="auth-feature-check">✓</span>
                    <span>Track your reading progress</span>
                  </li>
                  <li className="auth-feature-item">
                    <span className="auth-feature-check">✓</span>
                    <span>Save favorites and create reading lists</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
