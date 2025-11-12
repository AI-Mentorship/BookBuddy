const API_BASE_URL = "http://localhost:8080/api";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  pages: number;
  published: number;
  genres: string[];
  maturity: "Young Adult" | "Adult" | "Children" | "All Ages";
  rating: number;
  reviewCount: number;
  description: string;
  isbn?: string;
}

export interface ReadBook {
  book: Book;
  rating: number;
  review?: string;
}

// Books API
export async function fetchBooks(): Promise<Book[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/books`);
    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

export async function saveBook(book: Book): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });
    if (!response.ok) {
      throw new Error("Failed to save book");
    }
  } catch (error) {
    console.error("Error saving book:", error);
    throw error;
  }
}

export async function deleteSavedBook(bookId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/save/${bookId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete saved book");
    }
  } catch (error) {
    console.error("Error deleting saved book:", error);
    throw error;
  }
}

export async function markBookAsRead(book: Book, rating: number, review?: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ book, rating, review }),
    });
    if (!response.ok) {
      throw new Error("Failed to mark book as read");
    }
  } catch (error) {
    console.error("Error marking book as read:", error);
    throw error;
  }
}

export async function unmarkBookAsRead(bookId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/read/${bookId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to unmark book as read");
    }
  } catch (error) {
    console.error("Error unmarking book as read:", error);
    throw error;
  }
}

// Reviews API
export async function fetchReviews(): Promise<ReadBook[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`);
    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function createReview(book: Book, rating: number, review?: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ book, rating, review }),
    });
    if (!response.ok) {
      throw new Error("Failed to create review");
    }
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

// Helper function to check if error is a network/connection error
function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError ||
    error?.message?.includes("Failed to fetch") ||
    error?.message?.includes("NetworkError") ||
    error?.message?.includes("Network request failed")
  );
}

// Helper function to create a dummy guest account
function createDummyGuestAccount(userData?: {
  email?: string;
  firstName?: string;
  lastName?: string;
}): any {
  const firstName = userData?.firstName || "Guest";
  const lastName = userData?.lastName || "User";
  const email = userData?.email || "guest@bookbuddy.com";
  
  return {
    userId: 999,
    email: email,
    firstName: firstName,
    lastName: lastName,
    birthDate: new Date().toISOString().split("T")[0],
  };
}

// Auth API
export async function signup(userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error("Failed to sign up");
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error signing up:", error);
    // If it's a network error (backend not running), return dummy guest account
    if (isNetworkError(error)) {
      console.warn("Backend server not available. Using dummy guest account.");
      return createDummyGuestAccount({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    }
    throw error;
  }
}

export async function login(email: string, password: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Failed to login");
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error logging in:", error);
    // If it's a network error (backend not running), return dummy guest account
    if (isNetworkError(error)) {
      console.warn("Backend server not available. Using dummy guest account.");
      return createDummyGuestAccount({
        email: email,
      });
    }
    throw error;
  }
}

