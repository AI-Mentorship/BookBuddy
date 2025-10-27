import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Authentication.css";

const SignIn: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUserId, isAuthenticated } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

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

            // Store userId using AuthContext
            if (data.userId) {
                setUserId(data.userId);
            }

            // Navigate to dashboard
            navigate("/dashboard");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div>
                {/* Title Section */}
                <h1 className="app-title">BookBuddy</h1>
                <p className="app-subtitle">Your reading companion</p>

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

                        {/* Submit Button */}
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading && <span className="loading-spinner"></span>}
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="footer-text">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;