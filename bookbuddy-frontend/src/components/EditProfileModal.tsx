import { useState, useEffect, useRef } from "react";
import { useBooks } from "../context/BooksContext";
import { updateUser } from "../services/api";
import Toast from "./Toast";
import "../css/EditProfileModal.css";

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { userProfile, updateProfile } = useBooks();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Store initial values to detect changes
  const [initialValues, setInitialValues] = useState({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    birthDate: userProfile.birthDate || "",
  });

  const [formData, setFormData] = useState({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    birthDate: userProfile.birthDate || "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordHintToast, setPasswordHintToast] = useState<{ message: string; type: "info" } | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initial = {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      birthDate: userProfile.birthDate || "",
    };
    setInitialValues(initial);
    setFormData({
      ...initial,
      password: "",
    });
    setValidationErrors({});
    setTouchedFields(new Set());
  }, [userProfile]);

  // Scroll modal into view when it opens
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const formatDateForInput = (dateString: string): string => {
    // Convert MM/DD/YYYY or YYYY-MM-DD to YYYY-MM-DD for HTML date input
    if (!dateString) return "";
    if (dateString.includes("/")) {
      const [month, day, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateString;
  };

  const formatDateForAPI = (dateString: string): string => {
    // Convert YYYY-MM-DD to YYYY-MM-DD (API expects this format)
    return dateString;
  };

  const normalizeDate = (dateString: string): string => {
    // Normalize date for comparison (handle both formats)
    if (!dateString) return "";
    if (dateString.includes("/")) {
      const [month, day, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateString;
  };

  // Check if form has any changes
  const hasChanges = (): boolean => {
    const normalizedBirthDate = normalizeDate(formData.birthDate);
    const normalizedInitialBirthDate = normalizeDate(initialValues.birthDate);
    
    return (
      formData.firstName.trim() !== initialValues.firstName.trim() ||
      formData.lastName.trim() !== initialValues.lastName.trim() ||
      formData.email.trim() !== initialValues.email.trim() ||
      normalizedBirthDate !== normalizedInitialBirthDate ||
      formData.password.trim().length > 0
    );
  };

  // Real-time validation
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "email":
        if (!value.trim()) {
          return "Email is required";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Please enter a valid email address";
        }
        return "";
      case "password":
        if (value.trim().length > 0 && value.trim().length < 6) {
          return "Password must be at least 6 characters long";
        }
        return "";
      case "firstName":
        if (!value.trim()) {
          return "First name is required";
        }
        return "";
      case "lastName":
        if (!value.trim()) {
          return "Last name is required";
        }
        return "";
      case "birthDate":
        if (!value) {
          return "Birth date is required";
        }
        return "";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const firstNameError = validateField("firstName", formData.firstName);
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateField("lastName", formData.lastName);
    if (lastNameError) errors.lastName = lastNameError;

    const emailError = validateField("email", formData.email);
    if (emailError) errors.email = emailError;

    const birthDateError = validateField("birthDate", formData.birthDate);
    if (birthDateError) errors.birthDate = birthDateError;

    const passwordError = validateField("password", formData.password);
    if (passwordError) errors.password = passwordError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if save button should be enabled (without setting state)
  const canSave = (): boolean => {
    if (!hasChanges()) {
      return false; // No changes made
    }
    
    // Check all validations without setting state
    const firstNameError = validateField("firstName", formData.firstName);
    const lastNameError = validateField("lastName", formData.lastName);
    const emailError = validateField("email", formData.email);
    const birthDateError = validateField("birthDate", formData.birthDate);
    const passwordError = validateField("password", formData.password);
    
    // If any field has an error, disable save
    if (firstNameError || lastNameError || emailError || birthDateError || passwordError) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({ message: "Please fix the errors in the form", type: "error" });
      return;
    }

    if (!userProfile.userId) {
      setToast({ message: "User ID is missing. Please log in again.", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the request payload with only allowed fields
      const updatePayload: {
        firstName: string;
        lastName: string;
        email: string;
        birthDate: string;
        password?: string;
      } = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        birthDate: formatDateForAPI(formData.birthDate),
      };

      // Only include password in payload if it's non-empty to avoid backend null errors
      // Backend will only update password if this field is present and non-empty
      const trimmedPassword = formData.password.trim();
      if (trimmedPassword.length > 0) {
        updatePayload.password = trimmedPassword;
      }
      // If password is empty, we omit it entirely from the payload

      // Call the API endpoint
      const response = await updateUser(userProfile.userId, updatePayload);

      // Update local context with the response
      updateProfile({
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        birthDate: response.birthDate || formData.birthDate,
      });

      setToast({ message: "Profile updated successfully!", type: "success" });
      
      // Close modal after a short delay to show success toast
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile. Please try again.";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: "firstName" | "lastName" | "email" | "birthDate" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    const wasTouched = touchedFields.has(field);
    setTouchedFields((prev) => new Set(prev).add(field));
    
    // Validate field in real-time
    const error = validateField(field, value);
    const hadError = validationErrors[field];
    
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [field]: error }));
      // Show toast for password/email errors only if this is a new error and field was already touched
      if ((field === "password" || field === "email") && !hadError && wasTouched) {
        setToast({ message: error, type: "error" });
        setTimeout(() => setToast(null), 3000);
      }
    } else {
      // Clear error for this field
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      // Clear toast if error was fixed
      if (hadError && (field === "password" || field === "email")) {
        setToast(null);
      }
    }
  };

  const handleBlur = (field: "firstName" | "lastName" | "email" | "birthDate" | "password") => {
    // Mark field as touched
    setTouchedFields((prev) => new Set(prev).add(field));
    
    // Validate field on blur
    const value = formData[field];
    const error = validateField(field, value);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [field]: error }));
      // Show toast for password/email errors on blur
      if (field === "password" || field === "email") {
        setToast({ message: error, type: "error" });
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div ref={modalRef} className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2 className="edit-profile-title">Edit Profile</h2>
        <p className="edit-profile-description">Update your profile information here.</p>

        {/* Main toast for success/error messages */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        
        {/* Separate hint toast for password field guidance */}
        {passwordHintToast && (
          <div style={{ position: "fixed", top: toast ? "80px" : "20px", right: "20px", zIndex: 10001 }}>
            <Toast
              message={passwordHintToast.message}
              type={passwordHintToast.type}
              onClose={() => setPasswordHintToast(null)}
              duration={4000}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="edit-profile-row">
            <div className="edit-profile-field edit-profile-field-half">
              <label className="edit-profile-label">First Name</label>
              <input
                type="text"
                className={`edit-profile-input ${validationErrors.firstName ? "edit-profile-input-error" : ""}`}
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                onBlur={() => handleBlur("firstName")}
                required
                disabled={isSubmitting}
              />
              {validationErrors.firstName && (
                <span className="edit-profile-error-text">{validationErrors.firstName}</span>
              )}
            </div>

            <div className="edit-profile-field edit-profile-field-half">
              <label className="edit-profile-label">Last Name</label>
              <input
                type="text"
                className={`edit-profile-input ${validationErrors.lastName ? "edit-profile-input-error" : ""}`}
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                onBlur={() => handleBlur("lastName")}
                required
                disabled={isSubmitting}
              />
              {validationErrors.lastName && (
                <span className="edit-profile-error-text">{validationErrors.lastName}</span>
              )}
            </div>
          </div>

          <div className="edit-profile-field">
            <label className="edit-profile-label">Email</label>
            <input
              type="email"
              className={`edit-profile-input ${validationErrors.email ? "edit-profile-input-error" : ""}`}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              required
              disabled={isSubmitting}
            />
            {validationErrors.email && (
              <span className="edit-profile-error-text">{validationErrors.email}</span>
            )}
          </div>

          <div className="edit-profile-field">
            <label className="edit-profile-label">Birth Date</label>
            <input
              type="date"
              className={`edit-profile-input ${validationErrors.birthDate ? "edit-profile-input-error" : ""}`}
              value={formatDateForInput(formData.birthDate)}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              onBlur={() => handleBlur("birthDate")}
              required
              disabled={isSubmitting}
            />
            {validationErrors.birthDate && (
              <span className="edit-profile-error-text">{validationErrors.birthDate}</span>
            )}
          </div>

          <div className="edit-profile-field">
            <label className="edit-profile-label">New Password</label>
            <input
              type="password"
              className={`edit-profile-input ${validationErrors.password ? "edit-profile-input-error" : ""}`}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onFocus={() => {
                // Show hint toast when password field is focused
                setPasswordHintToast({
                  message: "Leave blank to keep current password. Minimum 6 characters if changing.",
                  type: "info",
                });
              }}
              onBlur={(e) => {
                // Clear hint toast when field loses focus
                setPasswordHintToast(null);
                // Validate password on blur
                handleBlur("password");
              }}
              placeholder="Leave blank to keep current password"
              disabled={isSubmitting}
            />
            {validationErrors.password && (
              <span className="edit-profile-error-text">{validationErrors.password}</span>
            )}
            <p className="edit-profile-hint">Leave blank to keep your current password. Minimum 6 characters if changing.</p>
          </div>

          <div className="edit-profile-actions">
            <button
              type="button"
              className="edit-profile-button edit-profile-button-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="edit-profile-button edit-profile-button-save"
              disabled={isSubmitting || !canSave()}
              title={!canSave() && !hasChanges() ? "Make changes to enable save" : !canSave() ? "Fix validation errors to enable save" : ""}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

