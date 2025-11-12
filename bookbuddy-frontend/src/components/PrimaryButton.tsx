import "../css/PrimaryButton.css";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = true,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`primary-button ${fullWidth ? "primary-button-full" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

