import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
    userId: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    dob: string | null;
    setUserId: (id: string | null) => void;
    setUserDetails: (details: {
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
        dob?: string | null;
    }) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // ✅ Keep your original userId logic exactly the same
    const [userId, setUserIdState] = useState<string | null>(() => {
        return localStorage.getItem("userId");
    });

    // ✅ Add optional extra user info
    const [userDetails, setUserDetailsState] = useState({
        firstName: null as string | null,
        lastName: null as string | null,
        email: null as string | null,
        dob: null as string | null,
    });

    // Update userId (same behavior as before)
    const setUserId = (id: string | null) => {
        setUserIdState(id);
        if (id) {
            localStorage.setItem("userId", id);
        } else {
            localStorage.removeItem("userId");
        }
    };

    // Update extra user info
    const setUserDetails = (details: {
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
        dob?: string | null;
    }) => {
        const updated = { ...userDetails, ...details };
        setUserDetailsState(updated);
        localStorage.setItem("userDetails", JSON.stringify(updated));
    };

    // Load saved details on mount
    React.useEffect(() => {
        const stored = localStorage.getItem("userDetails");
        if (stored) {
            try {
                setUserDetailsState(JSON.parse(stored));
            } catch {
                localStorage.removeItem("userDetails");
            }
        }
    }, []);

    // Logout clears everything
    const logout = () => {
        setUserId(null);
        setUserDetailsState({
            firstName: null,
            lastName: null,
            email: null,
            dob: null,
        });
        localStorage.removeItem("userId");
        localStorage.removeItem("userDetails");
    };

    const isAuthenticated = userId !== null;

    const value: AuthContextType = {
        userId,
        ...userDetails,
        setUserId,
        setUserDetails,
        logout,
        isAuthenticated,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
