import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import BookDetailsModal from "../components/BookDetailsModal";
import MarkAsReadModal from "../components/MarkAsReadModal";
import FiltersSidebar, { Filters } from "../components/FiltersSidebar";
import AIBookRecommendations from "../components/AIBookRecommendations";
import BookCard from "../components/BookCard";
import { Book } from "../services/api";
import { useBooks } from "../context/BooksContext";
import { mapDtoToBook } from "../services/axiosApi";
import "../css/DashboardPage.css";

const API_BASE_URL = "http://localhost:8080";

interface PagedBookResponseDTO {
  page: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  searchId: string;
  books: any[]; // BookDTO from backend
}

export default function DashboardPage() {
  const { userProfile } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showMarkAsRead, setShowMarkAsRead] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "title" | "author" | "isbn">("all");
  const [filters, setFilters] = useState<Filters>({
    pageLength: [],
    minRating: [],
    maturity: [],
  });

  // Search state management
  const [searchResults, setSearchResults] = useState<Book[]>([]); // Raw results from API
  const [filteredResults, setFilteredResults] = useState<Book[]>([]); // Filtered results for display
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxKnownPage, setMaxKnownPage] = useState(1); // Track highest page we've discovered
  const maxKnownPageRef = useRef(1); // Ref to track maxKnownPage without causing handleSearch to recreate
  const [loadingPage, setLoadingPage] = useState<number | null>(null); // Track which page is being loaded
  const [searchError, setSearchError] = useState<string | null>(null);
  const [totalSearchItems, setTotalSearchItems] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has actually searched (pressed Enter)

  // Filter application function
  const applyFilters = useCallback((books: Book[], activeFilters: Filters): Book[] => {
    let filtered = [...books];

    // Apply Page Length filters
    if (activeFilters.pageLength.length > 0) {
      filtered = filtered.filter((book) => {
        return activeFilters.pageLength.some((range) => {
          switch (range) {
            case "0-200":
              return book.pages >= 0 && book.pages <= 200;
            case "200-400":
              return book.pages > 200 && book.pages <= 400;
            case "400-600":
              return book.pages > 400 && book.pages <= 600;
            case "600+":
              return book.pages > 600;
            default:
              return true;
          }
        });
      });
    }

    // Apply Min Rating filters
    if (activeFilters.minRating.length > 0) {
      const minRatings = activeFilters.minRating.map((r) => {
        switch (r) {
          case "5":
            return 5;
          case "4+":
            return 4;
          case "3+":
            return 3;
          case "2+":
            return 2;
          default:
            return 0;
        }
      });
      const minRating = Math.min(...minRatings);
      filtered = filtered.filter((book) => book.rating >= minRating);
    }

    // Apply Maturity filters
    if (activeFilters.maturity.length > 0) {
      filtered = filtered.filter((book) =>
        activeFilters.maturity.includes(book.maturity)
      );
    }

    return filtered;
  }, []);

  // Search function - Always REPLACE results, never append
  const handleSearch = useCallback(async (query: string, filter: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setFilteredResults([]);
      setSearchError(null);
      setCurrentSearchId(null);
      setHasNextPage(false);
      setCurrentPage(1);
      setMaxKnownPage(1);
      maxKnownPageRef.current = 1;
      setTotalSearchItems(0);
      setHasSearched(false);
      return;
    }
    
    // Mark that a search has been executed
    setHasSearched(true);

    if (!userProfile.userId) {
      setSearchError("Please log in to search books.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setLoadingPage(page); // Track which page we're loading

    try {
      const response = await axios.get<PagedBookResponseDTO>(`${API_BASE_URL}/api/books/search`, {
        params: {
          userId: userProfile.userId,
          q: query,
          type: filter === "all" ? "general" : filter,
          page,
          pageSize: 20,
        },
      });

      const data = response.data;
      const books = data.books.map(mapDtoToBook);

      // CRITICAL: Always replace results, never append
      setSearchResults(books);
      setCurrentSearchId(data.searchId);
      setCurrentPage(page);
      setHasNextPage(data.hasNextPage);
      setTotalSearchItems(data.totalItems);

      // Track discovered pages
      if (page > maxKnownPageRef.current) {
        maxKnownPageRef.current = page;
        setMaxKnownPage(page);
      }

      // Scroll to top of results after page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Search failed:", error);
      
      // Handle rate limit errors specifically
      if (error.response?.status === 429) {
        setSearchError("Too many requests. Please wait a moment and try again.");
      } else {
        setSearchError(
          error.response?.data?.message || 
          error.message || 
          "Failed to search books. Please try again."
        );
      }
      
      if (page === 1) {
        setSearchResults([]);
        setFilteredResults([]);
      }
    } finally {
      setIsSearching(false);
      setLoadingPage(null); // Clear loading page when done
    }
  }, [userProfile.userId]); // Removed maxKnownPage dependency - use ref instead

  // Apply filters whenever searchResults or filters change
  useEffect(() => {
    const filtered = applyFilters(searchResults, filters);
    setFilteredResults(filtered);
  }, [searchResults, filters, applyFilters]);

  // Handle search submission (Enter key press)
  const handleSearchSubmit = useCallback((query: string, filter: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setFilteredResults([]);
      setSearchError(null);
      setCurrentSearchId(null);
      setHasNextPage(false);
      setCurrentPage(1);
      setMaxKnownPage(1);
      maxKnownPageRef.current = 1;
      setTotalSearchItems(0);
      return;
    }
    
    // Reset to page 1 for new search
    setCurrentPage(1);
    setMaxKnownPage(1);
    maxKnownPageRef.current = 1;
    setCurrentSearchId(null);
    handleSearch(query, filter, 1);
  }, [handleSearch]);

  // Clear results when search query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setFilteredResults([]);
      setSearchError(null);
      setCurrentSearchId(null);
      setHasNextPage(false);
      setCurrentPage(1);
      setMaxKnownPage(1);
      maxKnownPageRef.current = 1;
      setTotalSearchItems(0);
      setHasSearched(false);
    }
  }, [searchQuery]);

  // Pagination handlers
  const handlePageClick = useCallback((pageNum: number) => {
    if (pageNum === currentPage || pageNum < 1 || isSearching) return;
    handleSearch(searchQuery, searchFilter, pageNum);
  }, [currentPage, isSearching, searchQuery, searchFilter, handleSearch]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1 && !isSearching) {
      handleSearch(searchQuery, searchFilter, currentPage - 1);
    }
  }, [currentPage, isSearching, searchQuery, searchFilter, handleSearch]);

  const handleNext = useCallback(() => {
    if (hasNextPage && !isSearching) {
      handleSearch(searchQuery, searchFilter, currentPage + 1);
    }
  }, [hasNextPage, isSearching, searchQuery, searchFilter, currentPage, handleSearch]);

  // Generate page numbers to display (smart pagination)
  const getPageNumbers = useCallback((): number[] => {
    const pages: number[] = [];
    const maxDisplayed = 5; // Show 5 page buttons at a time

    // Calculate range around current page
    let start = Math.max(1, currentPage - 2);
    let end = start + maxDisplayed - 1;

    // Adjust end based on known pages
    const lastKnownPage = hasNextPage ? maxKnownPage + 1 : maxKnownPage;
    end = Math.min(end, lastKnownPage);

    // If we're near the end, adjust start to show 5 pages
    if (end - start < maxDisplayed - 1) {
      start = Math.max(1, end - maxDisplayed + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, maxKnownPage, hasNextPage]);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
    setShowMarkAsRead(false);
  };

  const handleMarkAsRead = () => {
    setShowMarkAsRead(true);
  };

  const handleCloseMarkAsRead = () => {
    setShowMarkAsRead(false);
  };

  const showFilters = searchQuery.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="dashboard-page page-fade">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchFilter={searchFilter}
        onSearchFilterChange={(filter) => setSearchFilter(filter as "all" | "title" | "author" | "isbn")}
        onSearchSubmit={handleSearchSubmit}
      />
      <div className="dashboard-layout">
        {showFilters && (
          <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
        )}
        <div className={`dashboard-content ${showFilters ? "dashboard-content-with-sidebar" : ""}`}>
          {hasSearchQuery ? (
            // Search Results Section
            <div className="search-results-section">
              <div className="search-results-header">
                <h2 className="search-results-title">
                  {isSearching && currentPage === 1 ? (
                    "Searching..."
                  ) : searchError ? (
                    "Search Error"
                  ) : !hasSearched ? (
                    `Ready to search for "${searchQuery}"`
                  ) : searchResults.length > 0 ? (
                    filteredResults.length !== searchResults.length ? (
                      `Showing ${filteredResults.length} of ${searchResults.length} filtered results for "${searchQuery}"`
                    ) : (
                      `Showing ${filteredResults.length}${totalSearchItems > searchResults.length ? ` of ${totalSearchItems}` : ""} results for "${searchQuery}"`
                    )
                  ) : (
                    `📚 Hmm, we couldn't find "${searchQuery}" in our library...`
                  )}
                </h2>
              </div>

              {/* Loading State - Initial Search */}
              {isSearching && currentPage === 1 && searchResults.length === 0 ? (
                <div className="search-loading">
                  <div className="loading-spinner"></div>
                  <p>Searching books...</p>
                </div>
              ) : !hasSearched ? (
                /* Typing State - User hasn't pressed Enter yet */
                <div className="search-empty">
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>⌨️</div>
                  <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                    Ready to discover your next great read?
                  </p>
                  <p className="search-empty-hint">
                    Press <strong>Enter</strong> to search our library for "{searchQuery}". 
                    We're excited to help you find your perfect book match!
                  </p>
                </div>
              ) : searchError ? (
                /* Error State */
                <div className="search-error">
                  <p>{searchError}</p>
                  <button 
                    className="search-retry-button"
                    onClick={() => {
                      setSearchError(null);
                      handleSearch(searchQuery, searchFilter, 1);
                    }}
                  >
                    Retry Search
                  </button>
                </div>
              ) : filteredResults.length === 0 && searchResults.length === 0 ? (
                /* No Results - No Search Results */
                <div className="search-empty">
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>📖</div>
                  <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                    This chapter seems to be missing from our library!
                  </p>
                  <p className="search-empty-hint">
                    Don't worry, every great story has plot twists. Try searching with different keywords, 
                    or maybe the book you're looking for is waiting to be discovered on another page.
                  </p>
                </div>
              ) : filteredResults.length === 0 && searchResults.length > 0 ? (
                /* No Results - Filters Applied */
                <div className="search-empty">
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                  <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                    Your filters are being a bit too picky!
                  </p>
                  <p className="search-empty-hint">
                    We found some great books, but they don't match your current filter settings. 
                    Try loosening your criteria a bit - sometimes the best reads are the ones we least expect!
                  </p>
                </div>
              ) : (
                /* Results Display */
                <>
                  <div className="search-results-grid">
                    {filteredResults.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onClick={() => handleBookClick(book)}
                      />
                    ))}
                  </div>
                  
                  {/* Loading Indicator for Page Changes */}
                  {isSearching && loadingPage && (
                    <div className="search-loading-more">
                      <div className="loading-spinner-small"></div>
                      <p>Loading page {loadingPage}...</p>
                    </div>
                  )}
                  
                  {/* Pagination Controls - Show if there are results and (has next page or not on page 1) */}
                  {searchResults.length > 0 && (hasNextPage || currentPage > 1) && (
                    <div className="pagination-container">
                      <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1 || isSearching}
                        className="pagination-button pagination-prev-next"
                      >
                        Previous
                      </button>
                      
                      <div className="page-numbers">
                        {getPageNumbers().map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageClick(pageNum)}
                            className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                            disabled={pageNum === currentPage || isSearching}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={handleNext}
                        disabled={!hasNextPage || isSearching}
                        className="pagination-button pagination-prev-next"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            // AI Book Recommendations Section - Main Focus
            <AIBookRecommendations onBookClick={handleBookClick} />
          )}
        </div>
      </div>

      {selectedBook && !showMarkAsRead && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseModal}
          onMarkAsRead={handleMarkAsRead}
        />
      )}

      {selectedBook && showMarkAsRead && (
        <MarkAsReadModal
          book={selectedBook}
          onClose={handleCloseMarkAsRead}
        />
      )}
    </div>
  );
}
