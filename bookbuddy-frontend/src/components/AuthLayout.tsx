import "../css/AuthLayout.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
}

export default function AuthLayout({ title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-logo">
        <div className="auth-logo-circle">
          <svg viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="30" fill="white" />
          </svg>
        </div>
        <div className="auth-logo-book">
          <svg viewBox="0 0 31 39" fill="none">
            <path
              d="M1.02113 34.1939V4.78304C1.02113 2.70113 2.78676 1.02113 4.96479 1.02113H28.2324C28.668 1.02113 29.0211 1.35867 29.0211 1.77505V31.5552M1.02113 34.1939C1.02113 32.6116 2.37067 31.3329 4.02591 31.3467L29.0211 31.5552M1.02113 34.1939C1.02113 35.7553 2.34536 37.0211 3.97887 37.0211H28.2324C28.668 37.0211 29.0211 36.6836 29.0211 36.2672V31.5552M12.0634 19.4923C13.0996 20.6302 15.8121 22.2232 18.3733 19.4923M12.0634 13.084V15.7227M18.3733 13.084V15.7227M26.2606 15.7227C26.2606 21.5521 21.3168 26.2777 15.2183 26.2777C9.11984 26.2777 4.17606 21.5521 4.17606 15.7227C4.17606 9.89336 9.11984 5.16773 15.2183 5.16773C21.3168 5.16773 26.2606 9.89336 26.2606 15.7227Z"
              stroke="#0742BF"
              strokeLinecap="round"
              strokeWidth="2.04225"
            />
          </svg>
        </div>
      </div>
      <h1 className="auth-title">{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>
    </div>
  );
}

