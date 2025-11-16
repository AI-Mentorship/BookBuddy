# Dashboard Documentation - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Backend API Endpoints](#backend-api-endpoints)
3. [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
4. [Frontend Components](#frontend-components)
5. [Data Flow](#data-flow)
6. [API Integration Examples](#api-integration-examples)
7. [State Management](#state-management)
8. [Error Handling](#error-handling)

---

## Overview

The Dashboard is the main landing page of BookBuddy that displays AI-powered book recommendations. It integrates with the BookSearchController for search functionality and the LLMController for personalized recommendations.

**Key Features:**
- AI Book Recommendations (currently disabled until ML service is stable)
- Book search functionality (via Navbar)
- Book details modal
- Mark books as read functionality
- Responsive design with filters sidebar

---

## Backend API Endpoints

### BookSearchController

**Base Path:** `/api/books`

#### GET `/api/books/search`

Searches for books using Google Books API with ML validation and ranking.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `userId` | Long | Yes | - | User ID for search session tracking |
| `q` | String | Yes | - | Search query string |
| `type` | String | No | `"general"` | Search type: `"general"`, `"title"`, `"author"`, `"isbn"` |
| `page` | int | No | `1` | Page number (1-indexed) |
| `pageSize` | int | No | `20` | Number of results per page (max 100) |
| `searchId` | String | No | - | Search session ID for pagination (auto-generated on first request) |

**Request Example:**
```
GET /api/books/search?userId=1&q=harry+potter&type=general&page=1&pageSize=20
```

**Response:** `PagedBookResponseDTO` (see DTOs section below)

**Response Example:**
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 150,
  "hasNextPage": true,
  "searchId": "550e8400-e29b-41d4-a716-446655440000",
  "books": [
    {
      "googleBooksId": "abc123",
      "title": "Harry Potter and the Philosopher's Stone",
      "authors": ["J.K. Rowling"],
      "publisher": "Bloomsbury",
      "publishedDate": "1997-06-26",
      "description": "A young wizard's journey...",
      "pageCount": 223,
      "categories": ["Fiction", "Fantasy"],
      "averageRating": 4.5,
      "maturityRating": "NOT_MATURE",
      "thumbnail": "https://...",
      "language": "en",
      "previewLink": "https://..."
    }
  ]
}
```

**Search Type Behavior:**
- `"general"`: Searches all fields (default)
- `"title"`: Formats query as `intitle:{query}`
- `"author"`: Formats query as `inauthor:{query}`
- `"isbn"`: Formats query as `isbn:{query}` (strips non-numeric characters)

**Pagination:**
- First request (page=1): Returns `searchId` in response
- Subsequent requests: Include `searchId` to maintain search session
- `hasNextPage`: Indicates if more results are available
- Results are validated by ML service and ranked by relevance

---

### LLMController (Recommendations)

**Base Path:** `/llm`

#### GET `/llm/getRecommendations/{userId}`

Fetches AI-powered book recommendations for a user.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | Long | Yes | User ID |

**Request Example:**
```
GET /llm/getRecommendations/1
```

**Response:** `List<BookDTO>` (see DTOs section below)

**Note:** Currently disabled in frontend until ML service is stable.

---

## Data Transfer Objects (DTOs)

### BookDTO

Represents a book with all its metadata.

**Package:** `com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO`

**Fields:**
| Field | Type | Description | Nullable |
|-------|------|-------------|----------|
| `googleBooksId` | String | Unique Google Books identifier | No |
| `title` | String | Book title | No |
| `authors` | List<String> | List of author names | Yes |
| `publisher` | String | Publisher name | Yes |
| `publishedDate` | String | Publication date (format: YYYY-MM-DD or YYYY) | Yes |
| `description` | String | Book description/synopsis | Yes |
| `pageCount` | Integer | Number of pages | Yes |
| `categories` | List<String> | Book categories/genres | Yes |
| `averageRating` | Double | Average rating (0.0 - 5.0) | Yes |
| `maturityRating` | String | Content rating (e.g., "NOT_MATURE", "MATURE") | Yes |
| `thumbnail` | String | URL to book cover thumbnail image | Yes |
| `language` | String | Language code (e.g., "en") | Yes |
| `previewLink` | String | URL to Google Books preview | Yes |
| `searchScore` | int | Internal ranking score (not exposed in API, `@JsonIgnore`) | N/A |

**Java Definition:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BookDTO {
    private String googleBooksId;
    private String title;
    private List<String> authors;
    private String publisher;
    private String publishedDate;
    private String description;
    private Integer pageCount;
    private List<String> categories;
    private Double averageRating;
    private String maturityRating;
    private String thumbnail;
    private String language;
    private String previewLink;
    
    @JsonIgnore
    private int searchScore; // used only for in memory ranking
}
```

**JSON Example:**
```json
{
  "googleBooksId": "abc123",
  "title": "The Great Gatsby",
  "authors": ["F. Scott Fitzgerald"],
  "publisher": "Scribner",
  "publishedDate": "1925-04-10",
  "description": "A classic American novel...",
  "pageCount": 180,
  "categories": ["Fiction", "Classic Literature"],
  "averageRating": 4.2,
  "maturityRating": "NOT_MATURE",
  "thumbnail": "https://books.google.com/books/content?id=abc123&printsec=frontcover&img=1",
  "language": "en",
  "previewLink": "https://books.google.com/books?id=abc123&hl=en"
}
```

---

### PagedBookResponseDTO

Represents a paginated response containing books and pagination metadata.

**Package:** `com.bookbuddy.dto.GoogleBookAPIDTO.PagedBookResponseDTO`

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `page` | int | Current page number (1-indexed) |
| `pageSize` | int | Number of items per page |
| `totalItems` | int | Total number of items available (from Google Books API) |
| `hasNextPage` | boolean | Whether more pages are available |
| `searchId` | String | Unique search session ID for pagination |
| `books` | List<BookDTO> | List of books for current page |

**Java Definition:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagedBookResponseDTO {
    private int page;
    private int pageSize;
    private int totalItems;
    private boolean hasNextPage;
    private String searchId;
    private List<BookDTO> books;
}
```

**JSON Example:**
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 150,
  "hasNextPage": true,
  "searchId": "550e8400-e29b-41d4-a716-446655440000",
  "books": [
    {
      "googleBooksId": "abc123",
      "title": "Book Title",
      ...
    }
  ]
}
```

---

## Frontend Components

### DashboardPage.tsx

**Location:** `bookbuddy-frontend/src/pages/DashboardPage.tsx`

**Purpose:** Main dashboard component that orchestrates book recommendations and search functionality.

**State Management:**
```typescript
const [selectedBook, setSelectedBook] = useState<Book | null>(null);
const [showMarkAsRead, setShowMarkAsRead] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const [searchFilter, setSearchFilter] = useState<"all" | "title" | "author" | "isbn">("all");
const [filters, setFilters] = useState<Filters>({
  pageLength: [],
  minRating: [],
  maturity: [],
});
```

**Key Features:**
- Integrates with `Navbar` for search functionality
- Displays `AIBookRecommendations` component
- Shows `FiltersSidebar` when search query is active
- Handles book selection and modal display
- Manages `BookDetailsModal` and `MarkAsReadModal`

**Component Structure:**
```tsx
<DashboardPage>
  <Navbar 
    searchQuery={searchQuery}
    onSearchChange={setSearchQuery}
    searchFilter={searchFilter}
    onSearchFilterChange={setSearchFilter}
  />
  <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
  <AIBookRecommendations onBookClick={handleBookClick} />
  <BookDetailsModal />
  <MarkAsReadModal />
</DashboardPage>
```

---

### AIBookRecommendations.tsx

**Location:** `bookbuddy-frontend/src/components/AIBookRecommendations.tsx`

**Purpose:** Displays AI-powered book recommendations with scroll-to-load-more functionality.

**Props:**
```typescript
interface AIBookRecommendationsProps {
    onBookClick?: (book: Book) => void;
}
```

**Key Features:**
- Uses `useRecommendations` hook for data fetching
- Implements Intersection Observer for scroll detection
- Shows confirmation dialog when scrolling to bottom
- Separates confirmed vs. new recommendations
- "Generate New Recommendations" button (currently disabled)
- Loading, error, and empty states

**State Management:**
```typescript
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [hasTriggeredScroll, setHasTriggeredScroll] = useState(false);
const [confirmedBookIds, setConfirmedBookIds] = useState<Set<string>>(new Set());
const [isGeneratingNew, setIsGeneratingNew] = useState(false);
```

**Data Flow:**
1. Component mounts → `useRecommendations(userId)` hook called
2. Hook fetches from `/llm/getRecommendations/{userId}` (currently disabled)
3. Books mapped from `BookDTO` to frontend `Book` interface
4. Books separated into `confirmedBooks` and `newBooks`
5. Scroll detection triggers confirmation dialog
6. User confirms → books marked as confirmed

---

### Navbar.tsx

**Location:** `bookbuddy-frontend/src/components/Navbar.tsx`

**Purpose:** Navigation bar with search functionality.

**Props:**
```typescript
interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchFilter?: string;
  onSearchFilterChange?: (filter: string) => void;
}
```

**Search Integration:**
- Search query is managed by parent component (`DashboardPage`)
- Search filter options: `"all"`, `"title"`, `"author"`, `"isbn"`
- Search functionality can be extended to call `/api/books/search` endpoint

**Note:** Currently, the search input is displayed but search API integration is not fully implemented in DashboardPage. The search functionality can be added by calling the BookSearchController endpoint.

---

## Data Flow

### Book Search Flow

```
User Types Query in Navbar
    ↓
DashboardPage updates searchQuery state
    ↓
(Optional) Call GET /api/books/search
    ↓
Backend: BookSearchService.searchBooksPaged()
    ↓
1. Format query based on type (intitle:, inauthor:, isbn:, or general)
2. Create/lookup SearchSession (cached in memory)
3. Fetch from Google Books API (40 books per chunk)
4. Validate book IDs with LLMService.getValidBookIds()
5. Rank books using BookSearchRanker.rankBooks()
6. Return PagedBookResponseDTO
    ↓
Frontend receives PagedBookResponseDTO
    ↓
Map BookDTO[] to Book[] using mapDtoToBook()
    ↓
Display books in grid/list
```

### Recommendations Flow

```
DashboardPage mounts
    ↓
AIBookRecommendations component renders
    ↓
useRecommendations(userId) hook called
    ↓
(Currently Disabled) GET /llm/getRecommendations/{userId}
    ↓
Backend: LLMService processes request
    1. Fetch user's saved books and read books
    2. Build LLMRequest with user data
    3. Call ML service for recommendations
    4. Fetch full BookDTO for each recommended ID
    5. Return List<BookDTO>
    ↓
Frontend maps BookDTO[] to Book[]
    ↓
Display in AIBookRecommendations component
```

---

## API Integration Examples

### Frontend: Search Books

**Using Axios (Recommended):**
```typescript
import axios from 'axios';

const API_BASE_URL = "http://localhost:8080";

interface SearchParams {
  userId: number;
  query: string;
  type?: "general" | "title" | "author" | "isbn";
  page?: number;
  pageSize?: number;
  searchId?: string;
}

async function searchBooks(params: SearchParams) {
  const { userId, query, type = "general", page = 1, pageSize = 20, searchId } = params;
  
  const response = await axios.get(`${API_BASE_URL}/api/books/search`, {
    params: {
      userId,
      q: query,
      type,
      page,
      pageSize,
      ...(searchId && { searchId }),
    },
  });
  
  return response.data; // PagedBookResponseDTO
}

// Example usage
const results = await searchBooks({
  userId: 1,
  query: "harry potter",
  type: "general",
  page: 1,
  pageSize: 20,
});

console.log(results.searchId); // Save for pagination
console.log(results.books); // Array of BookDTO
console.log(results.hasNextPage); // boolean
```

**Using Fetch API:**
```typescript
async function searchBooks(params: SearchParams) {
  const { userId, query, type = "general", page = 1, pageSize = 20, searchId } = params;
  
  const url = new URL(`${API_BASE_URL}/api/books/search`);
  url.searchParams.append("userId", userId.toString());
  url.searchParams.append("q", query);
  url.searchParams.append("type", type);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("pageSize", pageSize.toString());
  if (searchId) {
    url.searchParams.append("searchId", searchId);
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to search books");
  }
  
  return await response.json(); // PagedBookResponseDTO
}
```

### Frontend: Get Recommendations

**Using React Query Hook:**
```typescript
import { useRecommendations } from '../hooks/useRecommendations';

function MyComponent() {
  const userId = 1;
  const { books, isLoading, isError, error, refetchRecommendations, isMLEnabled } = useRecommendations(userId);
  
  if (isLoading) return <div>Loading recommendations...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  if (!isMLEnabled) return <div>ML recommendations are currently disabled</div>;
  
  return (
    <div>
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```

**Direct API Call:**
```typescript
import axios from 'axios';

async function getRecommendations(userId: number) {
  const response = await axios.get(`${API_BASE_URL}/llm/getRecommendations/${userId}`);
  return response.data; // List<BookDTO>
}
```

---

## State Management

### Frontend Book Interface

**Location:** `bookbuddy-frontend/src/services/api.ts`

```typescript
export interface Book {
    id: string;                    // Maps from googleBooksId
    title: string;                 // Maps from title
    author: string;                // Maps from authors[] (joined)
    coverImage: string;            // Maps from thumbnail
    pages: number;                 // Maps from pageCount
    published: number;              // Maps from publishedDate (year extracted)
    genres: string[];              // Maps from categories
    maturity: "Young Adult" | "Adult" | "Children" | "All Ages"; // Maps from maturityRating
    rating: number;                // Maps from averageRating
    reviewCount: number;           // Maps from ratingsCount (if available)
    description: string;           // Maps from description
    isbn?: string;                 // Extracted from industryIdentifiers
}
```

### Mapping Function

**Location:** `bookbuddy-frontend/src/services/axiosApi.ts`

```typescript
function mapDtoToBook(dto: any): Book {
    const id: string = dto.googleBooksId || dto.id || "";
    const title: string = dto.title || "Untitled";
    const authorList: string[] = Array.isArray(dto.authors) ? dto.authors : [];
    const author: string = authorList.length > 0 ? authorList.join(", ") : "Unknown Author";
    const coverImage: string = dto.thumbnail || dto.coverImage || "";
    const pages: number = typeof dto.pageCount === "number" ? dto.pageCount : 0;
    const published: number = parseYear(dto.publishedDate);
    const genres: string[] = Array.isArray(dto.categories) ? dto.categories : [];
    const rating: number = typeof dto.averageRating === "number" ? dto.averageRating : 0;
    const maturity: Book["maturity"] = normalizeMaturity(dto.maturityRating);
    const description: string = dto.description || "";
    const reviewCount: number = typeof dto.ratingsCount === "number" ? dto.ratingsCount : 0;
    const isbn: string | undefined = extractIsbn(dto);

    return {
        id, title, author, coverImage, pages, published,
        genres, maturity, rating, reviewCount, description, isbn,
    };
}
```

**Helper Functions:**
- `parseYear(publishedDate)`: Extracts year from date string (e.g., "1997-06-26" → 1997)
- `normalizeMaturity(maturityRating)`: Maps maturity rating to frontend enum
- `extractIsbn(dto)`: Extracts ISBN from industryIdentifiers array

---

## Error Handling

### Backend Error Responses

**BookSearchController:**
- `400 Bad Request`: Invalid parameters (e.g., page < 1, pageSize > 100)
- `400 Bad Request`: `searchId` required for page > 1 but not provided
- `400 Bad Request`: `searchId` does not belong to user
- `400 Bad Request`: Unknown or expired `searchId`

**LLMController:**
- `404 Not Found`: User not found
- `500 Internal Server Error`: ML service unavailable or error

### Frontend Error Handling

**Search Books:**
```typescript
try {
  const results = await searchBooks({ userId: 1, query: "harry potter" });
  // Handle success
} catch (error: any) {
  if (error.response?.status === 400) {
    console.error("Invalid search parameters");
  } else {
    console.error("Failed to search books:", error.message);
  }
}
```

**Recommendations:**
```typescript
const { books, isError, error } = useRecommendations(userId);

if (isError) {
  return <div>Error loading recommendations: {error.message}</div>;
}
```

---

## Backend Service Details

### BookSearchService

**Location:** `bookbuddy-backend/bookbuddy-springboot/src/main/java/com/bookbuddy/service/BookSearchService.java`

**Key Methods:**
- `searchBooksPaged()`: Main search method with pagination and ML validation
- `buildQuery()`: Formats query based on search type
- `safeGetBookById()`: Fetches book details with error handling

**Search Session Management:**
- Sessions cached in `ConcurrentHashMap<String, SearchSession>`
- Session includes: `userId`, `normalizedQuery`, `type`, `searchId`, `validatedQueue`, `seenGoogleIds`
- Sessions expire after inactivity (can be configured)

**ML Validation:**
- Books validated via `LLMService.getValidBookIds()`
- Only validated books are returned to frontend
- Validation happens in batches (40 books per Google API call)

**Ranking:**
- Books ranked by `BookSearchRanker.rankBooks()`
- Ranking considers: query match, title relevance, author match, rating

---

## Frontend Hooks

### useRecommendations

**Location:** `bookbuddy-frontend/src/hooks/useRecommendations.ts`

**Returns:**
```typescript
{
  books: Book[];                    // Array of recommended books
  isLoading: boolean;              // Loading state
  isError: boolean;                 // Error state
  error: Error | null;              // Error object
  refetchRecommendations: () => Promise<void>; // Refetch function
  isMLEnabled: boolean;             // Whether ML is enabled
  isFetching: boolean;              // Currently fetching
}
```

**Usage:**
```typescript
const { books, isLoading, isError, refetchRecommendations } = useRecommendations(userId);
```

**Configuration:**
- `staleTime`: 5 minutes (data considered fresh for 5 minutes)
- `retry`: false (no automatic retry on failure)
- `enabled`: Only when `ML_RECOMMENDATIONS_ENABLED === true` and `userId` is provided

---

## Complete Integration Example

### Adding Search to DashboardPage

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Book } from '../services/api';
import { mapDtoToBook } from '../services/axiosApi';

function DashboardPage() {
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "title" | "author" | "isbn">("all");
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string, filter: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get('http://localhost:8080/api/books/search', {
        params: {
          userId: userProfile.userId,
          q: query,
          type: filter === "all" ? "general" : filter,
          page,
          pageSize: 20,
          ...(currentSearchId && page > 1 && { searchId: currentSearchId }),
        },
      });

      const data = response.data; // PagedBookResponseDTO
      const books = data.books.map(mapDtoToBook);

      if (page === 1) {
        setSearchResults(books);
        setCurrentSearchId(data.searchId);
      } else {
        setSearchResults(prev => [...prev, ...books]);
      }

      setHasNextPage(data.hasNextPage);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery, searchFilter);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchFilter]);

  return (
    <div>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchFilter={searchFilter}
        onSearchFilterChange={setSearchFilter}
      />
      {isSearching && <div>Searching...</div>}
      {searchResults.length > 0 && (
        <div>
          {searchResults.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
          {hasNextPage && (
            <button onClick={() => handleSearch(searchQuery, searchFilter, currentPage + 1)}>
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Summary

### Backend Endpoints Used by Dashboard:
1. **GET `/api/books/search`** - Book search with pagination (from BookSearchController)
2. **GET `/llm/getRecommendations/{userId}`** - AI recommendations (currently disabled)

### DTOs:
1. **BookDTO** - Complete book information
2. **PagedBookResponseDTO** - Paginated search results

### Frontend Components:
1. **DashboardPage** - Main dashboard container
2. **AIBookRecommendations** - Recommendations display
3. **Navbar** - Search input and navigation
4. **BookCard** - Individual book display
5. **BookDetailsModal** - Book details popup
6. **MarkAsReadModal** - Mark book as read form

### Key Files:
- **Backend Controller:** `BookSearchController.java`
- **Backend Service:** `BookSearchService.java`
- **Backend DTOs:** `BookDTO.java`, `PagedBookResponseDTO.java`
- **Frontend Page:** `DashboardPage.tsx`
- **Frontend Component:** `AIBookRecommendations.tsx`
- **Frontend Hook:** `useRecommendations.ts`
- **Frontend API:** `axiosApi.ts`, `api.ts`

---

**Last Updated:** 2024
**Version:** 1.0

