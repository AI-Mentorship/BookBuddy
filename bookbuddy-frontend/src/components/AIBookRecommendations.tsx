import { useState, useCallback } from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import BookCard from './BookCard';
import { useBooks } from '../context/BooksContext';
import { Book } from '../services/api';
import { SkeletonGrid } from './SkeletonLoader';
import '../css/AIBookRecommendations.css';

interface AIBookRecommendationsProps {
    onBookClick?: (book: Book) => void;
}

export default function AIBookRecommendations({ onBookClick }: AIBookRecommendationsProps) {
    const { userProfile } = useBooks();
    const [isGeneratingNew, setIsGeneratingNew] = useState(false);

    const {
        books,
        isLoading,
        isError,
        error,
        refetchRecommendations,
        isFetching,
        isMLEnabled,
    } = useRecommendations(userProfile.userId);

    const handleGenerateNew = useCallback(async () => {
        if (!isMLEnabled) {
            return;
        }
        setIsGeneratingNew(true);
        try {
            await refetchRecommendations();
        } catch (err) {
            // Error is handled by React Query
        } finally {
            setIsGeneratingNew(false);
        }
    }, [refetchRecommendations, isMLEnabled]);

    const handleRetry = useCallback(() => {
        try {
            refetchRecommendations().catch(() => {
                // Error already handled by React Query
            });
        } catch (err) {
            console.warn('Failed to retry recommendations:', err);
        }
    }, [refetchRecommendations]);

    if (!userProfile.userId) {
        return null;
    }

    // Combine all books into one array - no sections
    const allBooks = Array.isArray(books) ? books.filter(book => book && book.id) : [];

    return (
        <div className="ai-recommendations-section">
            {/* Minimal Header */}
            <div className="ai-recommendations-header">
                <div className="header-content">
                    <h2 className="ai-recommendations-title">For You</h2>
                    <p className="ai-recommendations-subtitle">Based on your reading taste</p>
                </div>
                {isMLEnabled && (
                    <button
                        className="refresh-button"
                        onClick={handleGenerateNew}
                        disabled={isGeneratingNew || isLoading || isFetching}
                        title="Get new recommendations"
                    >
                        {isGeneratingNew || isFetching ? (
                            <div className="loading-spinner-small"></div>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Error Banner - Subtle */}
            {isError && (
                <div className="ai-recommendations-error-banner">
                    <span>Can't load recommendations right now</span>
                    {isMLEnabled && (
                        <button className="error-retry-link" onClick={handleRetry} disabled={isFetching}>
                            {isFetching ? 'Retrying...' : 'Retry'}
                        </button>
                    )}
                </div>
            )}

            {/* Loading State - Just Skeleton Cards */}
            {isLoading && allBooks.length === 0 ? (
                <div className="ai-recommendations-grid">
                    <SkeletonGrid count={20} />
                </div>
            ) : allBooks.length === 0 && !isError ? (
                <div className="ai-recommendations-empty">
                    <p>No recommendations available</p>
                    {isMLEnabled && (
                        <button 
                            className="generate-button-empty" 
                            onClick={handleGenerateNew}
                            disabled={isGeneratingNew || isLoading}
                        >
                            Get Recommendations
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Books Grid - All books in one continuous flow */}
                    <div className="ai-recommendations-grid">
                        {allBooks.map((book) => (
                            <div key={book.id} className="book-card-wrapper">
                                <BookCard
                                    book={book}
                                    onClick={() => {
                                        if (onBookClick) {
                                            onBookClick(book);
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Loading More - Subtle */}
                    {isFetching && !isLoading && allBooks.length > 0 && (
                        <div className="ai-recommendations-loading-more">
                            <div className="ai-recommendations-grid">
                                <SkeletonGrid count={8} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
