import React, {useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import "../css/Authentication.css";

const SignUp: React.FC = () => {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const {setUserId, isAuthenticated} = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/genre-preference");
        }
    }, [isAuthenticated, navigate]);


    // Validation helpers
    const isEmailValid = email.includes("@") && email.includes(".");
    const isPasswordLongEnough = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Frontend validation
        if (!isEmailValid) {
            setError("Please enter a valid email address");
            return;
        }

        if (!isPasswordLongEnough) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!hasUpperCase || !hasNumber) {
            setError("Password must contain at least one uppercase letter and one number");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/users/signUp", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password, firstName, lastName, birthDate}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create account");
            }

            const data = await response.json();

            // Store userId using AuthContext
            if (data.userId) {
                setUserId(data.userId);
            }

            console.log("Signup successful, userId:", data.userId);

            // After successful signup, go to questionnaire
            navigate("/genre-preference");

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
                <p className="app-subtitle">Join your reading community</p>

                {/* Signup Box */}
                <div className="login-box">
                    <h2>Create Account</h2>

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

                        {/* First and Last Name Row */}
                        <div className="form-row">
                            <div className="input-group">
                                <label className="input-label">First Name</label>
                                <input
                                    type="text"
                                    placeholder="John"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="login-input"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Last Name</label>
                                <input
                                    type="text"
                                    placeholder="Appleseed"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="login-input"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Birth Date Input */}
                        <div className="input-group">
                            <label className="input-label">Birth Date</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="login-input"
                                disabled={loading}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                                disabled={loading}
                                required
                            />
                            {password.length > 0 && (
                                <div className="validation-hints">
                                    <p className={`validation-hint ${isPasswordLongEnough ? 'valid' : 'invalid'}`}>
                                        {isPasswordLongEnough ? '✓' : '✗'} At least 6 characters
                                    </p>
                                    <p className={`validation-hint ${hasUpperCase ? 'valid' : 'invalid'}`}>
                                        {hasUpperCase ? '✓' : '✗'} One uppercase letter
                                    </p>
                                    <p className={`validation-hint ${hasNumber ? 'valid' : 'invalid'}`}>
                                        {hasNumber ? '✓' : '✗'} One number
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="input-group">
                            <label className="input-label">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="login-input"
                                disabled={loading}
                                required
                            />
                            {confirmPassword.length > 0 && (
                                <p className={`validation-hint ${passwordsMatch ? 'valid' : 'invalid'}`}>
                                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords must match'}
                                </p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && <p className="error-message">{error}</p>}

                        {/* Submit Button */}
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading && <span className="loading-spinner"></span>}
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="footer-text">
                        Already have an account? <Link to="/signin">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;