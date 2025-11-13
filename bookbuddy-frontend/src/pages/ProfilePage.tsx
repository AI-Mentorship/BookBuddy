import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import EditProfileModal from "../components/EditProfileModal";
import { useBooks } from "../context/BooksContext";
import "../css/ProfilePage.css";

export default function ProfilePage() {
    const navigate = useNavigate();
    const { userProfile, savedBooks, readBooks, updateProfile } = useBooks();
    const [showEditModal, setShowEditModal] = useState(false);

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

    return (
        <div className="profile-page page-fade">
            <Navbar />
            <div className="profile-content">
                {/* Profile Card */}
                <div className="profile-card">
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
                            <div className="profile-name-row">
                                <h1 className="profile-name">
                                    {userProfile.firstName} {userProfile.lastName}
                                </h1>
                                <button
                                    className="profile-logout-button"
                                    onClick={handleLogout}
                                >
                                    <span>→</span>
                                    Logout
                                </button>
                            </div>
                            <p className="profile-email">{userProfile.email}</p>
                            <p className="profile-bio">"{userProfile.bio || "Excited to Read!"}"</p>
                        </div>
                    </div>

                    <div className="profile-stats">
                        <div
                            className="profile-stat-item profile-stat-clickable"
                            onClick={() => navigate("/read")}
                        >
              <span className="profile-stat-value profile-stat-value-blue">
                {readBooks.length}
              </span>
                            <span className="profile-stat-label">Books Read</span>
                        </div>
                        <div className="profile-stat-item">
              <span className="profile-stat-value profile-stat-value-purple">
                {getReaderType()}
              </span>
                            <span className="profile-stat-label">Reader Type</span>
                        </div>
                        <div
                            className="profile-stat-item profile-stat-clickable"
                            onClick={() => navigate("/saved")}
                        >
              <span className="profile-stat-value profile-stat-value-green">
                {savedBooks.length}
              </span>
                            <span className="profile-stat-label profile-stat-label-underline">Saved Books</span>
                        </div>
                        <div
                            className="profile-stat-item profile-stat-clickable"
                            onClick={() => navigate("/reviews")}
                        >
              <span className="profile-stat-value profile-stat-value-orange">
                {readBooks.length}
              </span>
                            <span className="profile-stat-label profile-stat-label-underline">My Reviews</span>
                        </div>
                    </div>
                </div>

                {/* Genre Preferences Card */}
                <div className="profile-genres-card">
                    <div className="profile-genres-header">
                        <div>
                            <h2 className="profile-genres-title">Genre Preferences</h2>
                            <p className="profile-genres-description">
                                Select your favorite genres to get personalized recommendations
                            </p>
                        </div>
                        <button
                            className="profile-genres-edit-button"
                            onClick={() => navigate("/genres?edit=1")}
                        >
                            <span>✏️</span>
                            Edit
                        </button>
                    </div>
                    <div className="profile-genres-tags">
                        {userProfile.selectedGenres.length > 0 ? (
                            userProfile.selectedGenres.map((genre) => (
                                <span key={genre} className="profile-genre-tag">
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