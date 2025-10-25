import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../css/Login.css";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);


        try {
            const response = await fetch("http://localhost:8080/users/signIn", {
                method: "POST",
                headers: {"Content-Type": "application/json"}, // tells backend, JSON data is in the request body
                body: JSON.stringify({email, password}), // converts this into JSON
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Backend Error:", errorData); // log full error
                throw new Error(`${errorData.error}: ${errorData.message}`);
            }

            // Convert JSON response to JS object
            const data = await response.json();

            console.log("Logged in user:", data);

            // Example: store user info in state, context, or localStorage
            // setUser(data);

            navigate("/dashboard");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }

    };

    return (<div className="login-page"><h1 className="app-title">BookBuddy</h1>
            <div className="login-box"><h2>Sign-in</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                        disabled={loading}
                    />

                    ```
                    {error && <p className="error-message">{error}</p>}

                    <div className="login-links">
                        <a href="#">Forgot Password</a>
                        <a href="#">Login as Guest</a>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "Signing in..." : "Sign-In"}
                    </button>
                </form>
            </div>

            <footer className="footer">
                <a href="#">Discord</a>
                <a href="#">LinkedIn</a>
                <a href="#">Instagram</a>
                <a href="#">Github</a>
            </footer>
        </div>

    );
};

export default Login;
