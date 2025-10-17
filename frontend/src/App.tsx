import React, { useState } from "react";
import SignIn from "./SignIn";
import Questionnaire from "./Questionnaire";

const App: React.FC = () => {
  const [page, setPage] = useState<"signin" | "questionnaire" | "dashboard">("signin");

  if (page === "questionnaire") {
    return (
      <Questionnaire
        onDashboard={() => setPage("dashboard")}
        onBack={() => setPage("signin")}
      />
    );
  }

  if (page === "dashboard") {
    return (
      <div style={{ textAlign: "center", color: "white", marginTop: "5rem" }}>
        <h1>Dashboard</h1>
        <p>This will be merged with sai's dashboard later.</p>
        <button
          style={{
            marginTop: "2rem",
            padding: "0.8rem 1.2rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={() => setPage("questionnaire")}
        >
          Back to Questionnaire
        </button>
      </div>
    );
  }

  return <SignIn onSignIn={() => setPage("questionnaire")} />;
};

export default App;