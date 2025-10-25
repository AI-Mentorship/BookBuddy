import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/Authentication.css";

const SignIn: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Validation helpers
    const isEmailValid = email.includes("@") && email.includes(".");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Frontend validation
        if (!isEmailValid) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/users/signIn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to sign in");
            }

            const data = await response.json();
            console.log("Login successful");

            // Store userId for later use (like in questionnaire)
            if (data.userId) {
                localStorage.setItem("userId", data.userId);
            }

            // Login goes straight to dashboard (skip questionnaire)
            navigate("/dashboard");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Title Section */}
            <div>
                <h1 className="app-title">BookBuddy</h1>
                <p className="app-subtitle">Your reading companion</p>
            </div>

            {/* Login Box */}
            <div className="login-box">
                <h2>Welcome back</h2>

                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                            disabled={loading}
                            required
                        />
                        {email.length > 0 && (
                            <p className={`validation-hint ${isEmailValid ? 'valid' : 'invalid'}`}>
                                {isEmailValid ? '✓ Valid email' : '✗ Must contain @ and domain'}
                            </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Error Message */}
                    {error && <p className="error-message">{error}</p>}

                    {/* Links */}
                    <div className="login-links">
                        <Link to="/forgot-password">Forgot password?</Link>
                        <Link to="/signup">Create An Account</Link>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                {/* Divider */}
                <div className="divider">
                    <span>Connect with us</span>
                </div>

                {/* Social Links */}
                <div className="social-links">
                    <button className="social-btn" title="Discord" type="button">D</button>
                    <button className="social-btn" title="LinkedIn" type="button">L</button>
                    <button className="social-btn" title="Instagram" type="button">I</button>
                    <button className="social-btn" title="Github" type="button">G</button>
                </div>
            </div>

            {/* Footer */}
            <p className="footer-text">
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
        </div>
    );
};

export default SignIn;