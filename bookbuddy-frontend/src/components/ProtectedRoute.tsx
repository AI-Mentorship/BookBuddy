import { Navigate } from "react-router-dom";
import { useBooks } from "../context/BooksContext";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useBooks();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}
