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
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userData = await api.login(email, password);

            updateProfile({
                userId: userData.userId,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                birthDate: userData.birthDate,
                profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userData.firstName + " " + userData.lastName
                )}&background=0742BF&color=fff&size=200`,
            });

            // After login, go directly to dashboard. Questionnaire appears only for new accounts.
            navigate("/dashboard");
        } catch (error: any) {
            console.error("Login error:", error);
            setError(error.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!email || !password || !firstName || !lastName || !birthDate) {
            setError("All fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const userData = await api.signup({
                email,
                password,
                firstName,
                lastName,
                birthDate,
            });

            updateProfile({
                userId: userData.userId,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                birthDate: userData.birthDate,
                profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userData.firstName + " " + userData.lastName
                )}&background=0742BF&color=fff&size=200`,
            });

            // After signup, proceed to onboarding questionnaire
            navigate("/genres");
        } catch (error: any) {
            console.error("Signup error:", error);
            setError(error.message || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
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
                                        required
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
                                required
                            />
                            <PrimaryButton type="submit" disabled={loading}>
                                {loading ? "Signing in..." : "Sign in"}
                            </PrimaryButton>
                        </form>
                    ) : (
                        <form className="auth-form" onSubmit={handleSignup}>
                            {error && (
                                <div className="auth-error-message" style={{ marginBottom: "1rem" }}>
                                    <span className="auth-error-icon">⚠</span>
                                    <span className="auth-error-text">{error}</span>
                                </div>
                            )}
                            <Input
                                label="Email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                            <div className="auth-form-row">
                                <div className="auth-form-group-half">
                                    <Input
                                        label="First Name"
                                        type="text"
                                        placeholder="John"
                                        value={firstName}
                                        onChange={(e) => {
                                            setFirstName(e.target.value);
                                            setError("");
                                        }}
                                        required
                                    />
                                </div>
                                <div className="auth-form-group-half">
                                    <Input
                                        label="Last Name"
                                        type="text"
                                        placeholder="Appleseed"
                                        value={lastName}
                                        onChange={(e) => {
                                            setLastName(e.target.value);
                                            setError("");
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                            <Input
                                label="Birth Date"
                                type="date"
                                value={birthDate}
                                onChange={(e) => {
                                    setBirthDate(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                            <PrimaryButton type="submit" disabled={loading}>
                                {loading ? "Creating account..." : "Create Account"}
                            </PrimaryButton>
                        </form>
                    )}

                    <p className="auth-switch">
                        {mode === "login" ? (
                            <>
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    className="auth-link"
                                    onClick={() => {
                                        setMode("signup");
                                        setError("");
                                    }}
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
                                    onClick={() => {
                                        setMode("login");
                                        setError("");
                                    }}
                                >
                                    Sign In
                                </button>
                            </>
                        )}
                    </p>

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