frontend/
│── public/ # Static assets
│
│── src/
│ ├── api/ # API layer
│ │ ├── auth.ts # Login, signup, refresh
│ │ ├── books.ts # Book search, metadata requests
│ │ ├── recommend.ts # Recommendation fetch calls
│ │ └── users.ts # User profile CRUD
│ │
│ ├── components/ # Reusable UI components
│ │ ├── layout/ # NavBar, Footer, Sidebar
│ │ ├── books/ # BookCard, BookList
│ │ ├── users/ # ProfileCard, UserMenu
│ │ └── common/ # Buttons, Modals, Inputs
│ │
│ ├── pages/ # Route-based views
│ │ ├── Home.tsx
│ │ ├── Search.tsx
│ │ ├── Recommendations.tsx
│ │ ├── Profile.tsx
│ │ └── Login.tsx
│ │
│ ├── hooks/ # Custom React hooks
│ │ ├── useAuth.ts # Authentication state
│ │ └── useBooks.ts # Book search/query logic
│ │
│ ├── context/ # Global contexts
│ │ └── AuthContext.tsx # Provide auth state & actions
│ │
│ ├── styles/ # Global & theme styles (CSS or Tailwind)
│ │ ├── index.css
│ │ └── theme.ts
│ │
│ ├── utils/ # Utility helpers
│ │ ├── format.ts # Formatters (dates, strings)
│ │ └── constants.ts # App constants (API URLs, etc.)
│ │
│ ├── App.tsx # Root app component
│ ├── main.tsx # Entry point
│ └── vite-env.d.ts
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
