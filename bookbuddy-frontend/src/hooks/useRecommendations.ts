import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Book } from '../services/api';

// Map backend BookDTO to frontend Book (re-export from axiosApi if available, or define here)
function mapDtoToBookLocal(dto: any): Book {
    if (!dto || typeof dto !== "object") {
        return {
            id: "",
            title: "Untitled",
            author: "Unknown Author",
            coverImage: "",
            pages: 0,
            published: new Date().getFullYear(),
            genres: [],
            maturity: "NOT_MATURE",
            rating: 0,
            reviewCount: 0,
            description: "",
        };
    }

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
        id,
        title,
        author,
        coverImage,
        pages,
        published,
        genres,
        maturity,
        rating,
        reviewCount,
        description,
        isbn,
    };
}

function parseYear(publishedDate?: string): number {
    if (!publishedDate || typeof publishedDate !== "string") return new Date().getFullYear();
    const match = publishedDate.match(/\d{4}/);
    if (match) {
        const year = parseInt(match[0], 10);
        if (!isNaN(year)) return year;
    }
    return new Date().getFullYear();
}

function normalizeMaturity(val?: string): Book["maturity"] {
    if (!val || typeof val !== "string") return "NOT_MATURE";
    const v = val.toUpperCase();
    if (v === "MATURE") return "MATURE";
    return "NOT_MATURE"; // Default to NOT_MATURE for any other value
}

function extractIsbn(dto: any): string | undefined {
    const ids = dto?.industryIdentifiers;
    if (Array.isArray(ids)) {
        const isbn13 = ids.find((i: any) => i?.type === "ISBN_13")?.identifier;
        const isbn10 = ids.find((i: any) => i?.type === "ISBN_10")?.identifier;
        return isbn13 || isbn10 || undefined;
    }
    return undefined;
}

const API_BASE_URL = "http://localhost:8080";

// ML Recommendations enabled - backend validation is commented out but feature is active
const ML_RECOMMENDATIONS_ENABLED = true;

export function useRecommendations(userId: number | undefined) {
    const queryClient = useQueryClient();
    
    const query = useQuery({
        queryKey: ['recommendations', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID is required');
            
            // Using GET /llm/getRecommendations/{userId} endpoint
            // Backend returns List<BookDTO> - all books are fetched in parallel by backend
            // Note: Backend ML validation is commented out but feature is active
            if (!ML_RECOMMENDATIONS_ENABLED) {
                // Return empty array without making API call
                return [] as Book[];
            }
            
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/llm/getRecommendations/${userId}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 30000, // 30 second timeout
                    }
                );
                
                const books: Book[] = Array.isArray(response.data) 
                    ? response.data.map(mapDtoToBookLocal)
                    : [];
                
                return books;
            } catch (error: any) {
                // Handle specific error cases
                if (error.response?.status === 404) {
                    throw new Error('User not found');
                } else if (error.response?.status === 500) {
                    throw new Error('ML service is currently unavailable. Please try again later.');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timed out. Please try again.');
                } else if (error.response?.status === 503) {
                    throw new Error('ML service is temporarily unavailable. Please try again later.');
                } else if (error.message) {
                    throw new Error(`Failed to fetch recommendations: ${error.message}`);
                } else {
                    throw new Error('Failed to fetch recommendations. Please try again.');
                }
            }
        },
        enabled: ML_RECOMMENDATIONS_ENABLED && !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1, // Retry once on failure
        retryDelay: 1000, // Wait 1 second before retry
    });

    const refetchRecommendations = async () => {
        if (!ML_RECOMMENDATIONS_ENABLED) {
            // Return a resolved promise without making API call
            return Promise.resolve({ data: [] as Book[] });
        }
        await queryClient.invalidateQueries({ queryKey: ['recommendations', userId] });
        return query.refetch();
    };

    return {
        ...query,
        books: query.data ?? [],
        refetchRecommendations,
        isMLEnabled: ML_RECOMMENDATIONS_ENABLED,
    };
}

