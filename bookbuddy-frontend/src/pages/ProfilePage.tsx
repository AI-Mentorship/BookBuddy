import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import EditProfileModal from "../components/EditProfileModal";
import { useBooks } from "../context/BooksContext";
import "../css/ProfilePage.css";

export default function ProfilePage() {
    const navigate = useNavigate();
    const { userProfile, savedBooks, readBooks, updateProfile, loadGenrePreferences } = useBooks();
    const [showEditModal, setShowEditModal] = useState(false);
    const [loadingGenres, setLoadingGenres] = useState(false);

    // Always fetch genre preferences from backend when profile page is visited
    useEffect(() => {
        const loadGenres = async () => {
            if (!userProfile?.userId) return;

            try {
                setLoadingGenres(true);
                // Always call backend to get the latest genres from database
                await loadGenrePreferences();
            } catch (error) {
                console.error("Failed to load genre preferences on profile page:", error);
            } finally {
                setLoadingGenres(false);
            }
        };

        loadGenres();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile?.userId]); // Reload whenever userId changes

    const getReaderType = (): string => {
        const count = readBooks.length;
        if (count === 0) return "New Reader";
        if (count < 5) return "Casual Reader";
        if (count < 20) return "Active Reader";
        return "Bookworm";
    };

    const getInitials = (): string => {
        return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            // Clear user profile
            updateProfile({
                userId: undefined,
                firstName: "",
                lastName: "",
                email: "",
                birthDate: "",
                profilePicture: "",
                bio: "",
                favoriteBook: "",
                selectedGenres: [],
            });

            // Redirect to auth page
            navigate("/");
        }
    };

    // Calculate progress percentages for circular stats
    const booksReadProgress = Math.min((readBooks.length / 50) * 100, 100);
    const savedBooksProgress = Math.min((savedBooks.length / 50) * 100, 100);
    const reviewsProgress = Math.min((readBooks.length / 30) * 100, 100);

    // Get color based on progress percentage
    const getProgressColor = (progress: number): string => {
        if (progress <= 25) {
            return "rgba(255, 100, 50, 0.8)"; // Orange/red for 0-25%
        } else if (progress <= 75) {
            return "rgba(255, 200, 0, 0.8)"; // Yellow for 26-75%
        } else {
            return "rgba(50, 200, 100, 0.8)"; // Green for 76-100%
        }
    };

    return (
        <div className="profile-page page-fade">
            <Navbar />
            
            {/* Logout Icon - Top Right */}
            <button className="profile-logout-icon" onClick={handleLogout} title="Logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            <div className="profile-content">
                {/* Profile Header - Compact Sidebar Style */}
                <div className="profile-header">
                    <div
                        className="profile-avatar"
                        onClick={() => setShowEditModal(true)}
                        style={{ cursor: "pointer" }}
                    >
                        {userProfile.profilePicture ? (
                            <img
                                src={userProfile.profilePicture}
                                alt={`${userProfile.firstName} ${userProfile.lastName}`}
                                className="profile-avatar-image"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = "flex";
                                }}
                            />
                        ) : null}
                        <div className="profile-avatar-fallback" style={{ display: userProfile.profilePicture ? "none" : "flex" }}>
                            {getInitials()}
                        </div>
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name">
                            {userProfile.firstName} {userProfile.lastName}
                        </h1>
                        <p className="profile-email">{userProfile.email}</p>
                        <p className="profile-bio">"{userProfile.bio || "Excited to Read!"}"</p>
                    </div>
                </div>

                {/* Stats Dashboard - Circular Design */}
                <div className="profile-stats-dashboard">
                    <div
                        className="profile-stat-circle profile-stat-clickable"
                        onClick={() => navigate("/read")}
                    >
                        <svg className="profile-stat-ring" viewBox="0 0 100 100">
                            <circle
                                className="profile-stat-ring-bg"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                            />
                            <circle
                                className="profile-stat-ring-progress"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                                stroke={getProgressColor(booksReadProgress)}
                                strokeDasharray={`${2 * Math.PI * 45}`}
                                strokeDashoffset={`${2 * Math.PI * 45 * (1 - booksReadProgress / 100)}`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="profile-stat-circle-content">
                            <div className="profile-stat-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <span className="profile-stat-value">{readBooks.length}</span>
                            <span className="profile-stat-label">Books Read</span>
                        </div>
                    </div>

                    <div className="profile-stat-circle">
                        <svg className="profile-stat-ring" viewBox="0 0 100 100">
                            <circle
                                className="profile-stat-ring-bg"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                            />
                            <circle
                                className="profile-stat-ring-progress"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                                stroke={getProgressColor(25)}
                                strokeDasharray={`${2 * Math.PI * 45}`}
                                strokeDashoffset={`${2 * Math.PI * 45 * 0.25}`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="profile-stat-circle-content">
                            <div className="profile-stat-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <span className="profile-stat-value-small">{getReaderType()}</span>
                            <span className="profile-stat-label">Reader Type</span>
                        </div>
                    </div>

                    <div
                        className="profile-stat-circle profile-stat-clickable"
                        onClick={() => navigate("/saved")}
                    >
                        <svg className="profile-stat-ring" viewBox="0 0 100 100">
                            <circle
                                className="profile-stat-ring-bg"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                            />
                            <circle
                                className="profile-stat-ring-progress"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                                stroke={getProgressColor(savedBooksProgress)}
                                strokeDasharray={`${2 * Math.PI * 45}`}
                                strokeDashoffset={`${2 * Math.PI * 45 * (1 - savedBooksProgress / 100)}`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="profile-stat-circle-content">
                            <div className="profile-stat-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <span className="profile-stat-value">{savedBooks.length}</span>
                            <span className="profile-stat-label">Saved Books</span>
                        </div>
                    </div>

                    <div
                        className="profile-stat-circle profile-stat-clickable"
                        onClick={() => navigate("/reviews")}
                    >
                        <svg className="profile-stat-ring" viewBox="0 0 100 100">
                            <circle
                                className="profile-stat-ring-bg"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                            />
                            <circle
                                className="profile-stat-ring-progress"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                                stroke={getProgressColor(reviewsProgress)}
                                strokeDasharray={`${2 * Math.PI * 45}`}
                                strokeDashoffset={`${2 * Math.PI * 45 * (1 - reviewsProgress / 100)}`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="profile-stat-circle-content">
                            <div className="profile-stat-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <span className="profile-stat-value">{readBooks.length}</span>
                            <span className="profile-stat-label">My Reviews</span>
                        </div>
                    </div>
                </div>

                {/* Genre Preferences - Compact Section */}
                <div className="profile-genres-section">
                    <div className="profile-genres-header">
                        <h2 className="profile-genres-title">Genre Preferences</h2>
                        <button
                            className="profile-genres-edit-button"
                            onClick={() => navigate("/genres?edit=1")}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Edit
                        </button>
                    </div>
                    <div className="profile-genres-tags">
                        {loadingGenres ? (
                            <p className="profile-genres-empty">Loading genres...</p>
                        ) : userProfile.selectedGenres && userProfile.selectedGenres.length > 0 ? (
                            userProfile.selectedGenres.map((genre, index) => (
                                <span 
                                    key={genre} 
                                    className="profile-genre-tag"
                                >
                                    {genre}
                                </span>
                            ))
                        ) : (
                            <p className="profile-genres-empty">No genres selected yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}
        </div>
    );
}
