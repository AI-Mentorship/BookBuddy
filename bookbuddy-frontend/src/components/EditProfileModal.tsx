import { useState, useEffect } from "react";
import { useBooks, UserProfile } from "../context/BooksContext";
import "../css/EditProfileModal.css";

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { userProfile, updateProfile } = useBooks();
  const [formData, setFormData] = useState<UserProfile>(userProfile);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const formatDateForInput = (dateString: string): string => {
    // Convert MM/DD/YYYY to YYYY-MM-DD for HTML date input
    if (dateString.includes("/")) {
      const [month, day, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateString;
  };

  const formatDateFromInput = (dateString: string): string => {
    // Convert YYYY-MM-DD to MM/DD/YYYY for storage
    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-");
      return `${month}/${day}/${year}`;
    }
    return dateString;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    onClose();
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2 className="edit-profile-title">Edit Profile</h2>
        <p className="edit-profile-description">Update your profile information here.</p>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="edit-profile-field">
            <label className="edit-profile-label">Profile Picture URL</label>
            <input
              type="text"
              className="edit-profile-input"
              value={formData.profilePicture}
              onChange={(e) => handleChange("profilePicture", e.target.value)}
            />
            <p className="edit-profile-hint">Enter a URL for your profile picture.</p>
          </div>

          <div className="edit-profile-row">
            <div className="edit-profile-field edit-profile-field-half">
              <label className="edit-profile-label">First Name</label>
              <input
                type="text"
                className="edit-profile-input"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </div>

            <div className="edit-profile-field edit-profile-field-half">
              <label className="edit-profile-label">Last Name</label>
              <input
                type="text"
                className="edit-profile-input"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="edit-profile-field">
            <label className="edit-profile-label">Email</label>
            <input
              type="email"
              className="edit-profile-input"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div className="edit-profile-field">
            <label className="edit-profile-label">Birth Date</label>
            <input
              type="date"
              className="edit-profile-input"
              value={formatDateForInput(formData.birthDate)}
              onChange={(e) => handleChange("birthDate", formatDateFromInput(e.target.value))}
              required
            />
          </div>

          <div className="edit-profile-field">
            <label className="edit-profile-label">Favorite Book</label>
            <input
              type="text"
              className="edit-profile-input"
              placeholder="e.g., Harry Potter and the Sorcerer's Stone"
              value={formData.favoriteBook}
              onChange={(e) => handleChange("favoriteBook", e.target.value)}
            />
          </div>

          <div className="edit-profile-field">
            <label className="edit-profile-label">About Me</label>
            <textarea
              className="edit-profile-textarea"
              rows={4}
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </div>

          <div className="edit-profile-actions">
            <button
              type="button"
              className="edit-profile-button edit-profile-button-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="edit-profile-button edit-profile-button-save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

