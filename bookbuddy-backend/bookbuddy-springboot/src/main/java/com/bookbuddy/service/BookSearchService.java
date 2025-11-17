package com.bookbuddy.service;

import java.util.*;

import org.springframework.stereotype.Service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPISearchResponse;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPISearchResponse.Item;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPISearchResponse.VolumeInfo;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPISearchResponse.ImageLinks;
import com.bookbuddy.dto.GoogleBookAPIDTO.PagedBookResponseDTO;
import com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO;

@Service
public class BookSearchService {

    private final GoogleBookAPI googleBookAPI;
    private final LLMService llmService;

    public BookSearchService(GoogleBookAPI googleBookAPI, LLMService llmService) {
        this.googleBookAPI = googleBookAPI;
        this.llmService = llmService;
    }

    /**
     * Simplified search with direct pagination - no session tracking needed.
     * Each page makes exactly 1 API call to Google Books.
     */
    public PagedBookResponseDTO searchBooksPaged(Long userId, String query, String type, int page, int pageSize, String searchId) {
        if (query == null || query.isBlank()) {
            return emptyPagedResponse(page, pageSize);
        }

        // Enforce sane bounds
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 40) pageSize = 40; // Google's max is 40 per request

        // Build the formatted query for Google (intitle:, inauthor:, isbn:, or general)
        String formattedQuery = buildQuery(query.trim(), type);

        // Calculate the start index for this page
        // Page 1 = startIndex 0, Page 2 = startIndex 20, Page 3 = startIndex 40, etc.
        int startIndex = (page - 1) * pageSize;

        // Fetch exactly pageSize books from Google at the correct offset
        GoogleBookAPISearchResponse searchResp = googleBookAPI.rawSearch(formattedQuery, startIndex, pageSize);

        if (searchResp == null || searchResp.getItems() == null || searchResp.getItems().isEmpty()) {
            return emptyPagedResponse(page, pageSize);
        }

        // Convert all Items to BookDTOs
        List<BookDTO> allBooks = new ArrayList<>();
        List<String> bookIds = new ArrayList<>();
        
        for (Item item : searchResp.getItems()) {
            if (item == null || item.getId() == null) continue;
            
            BookDTO bookDTO = convertItemToBookDTO(item);
            if (bookDTO != null) {
                allBooks.add(bookDTO);
                bookIds.add(item.getId());
            }
        }

        // ==================== ML VALIDATION COMMENTED OUT ====================
        // TODO: Uncomment when ML validation service is ready
        // This would filter out invalid books before returning them
        /*
        if (!bookIds.isEmpty()) {
            List<String> validatedIds = llmService.getValidBookIds(bookIds);
            if (validatedIds != null && !validatedIds.isEmpty()) {
                Set<String> validIdSet = new HashSet<>(validatedIds);
                // Filter allBooks to only include validated IDs
                allBooks = allBooks.stream()
                    .filter(book -> validIdSet.contains(book.getGoogleBooksId()))
                    .collect(Collectors.toList());
            } else {
                allBooks = new ArrayList<>(); // No valid books
            }
        }
        */
        // TEMPORARY: Accept all books without ML filtering
        // ======================================================================

        // Rank the books
        List<BookDTO> ranked = BookSearchRanker.rankBooks(allBooks, query, type);

        // Determine if there are more pages
        int totalItems = searchResp.getTotalItems();
        boolean hasNextPage = (startIndex + ranked.size()) < totalItems && !ranked.isEmpty();

        // Build response
        return PagedBookResponseDTO.builder()
                .page(page)
                .pageSize(pageSize)
                .totalItems(totalItems)
                .hasNextPage(hasNextPage)
                .searchId(null) // No session tracking needed
                .books(ranked)
                .build();
    }

    /**
     * Converts a Google Books API Item to our BookDTO
     * This eliminates the need for individual API calls per book
     */
    private BookDTO convertItemToBookDTO(Item item) {
        if (item == null || item.getId() == null) return null;

        try {
            VolumeInfo volumeInfo = item.getVolumeInfo();
            if (volumeInfo == null) return null;

            BookDTO.BookDTOBuilder builder = BookDTO.builder();
            
            // Basic info
            builder.googleBooksId(item.getId());
            builder.title(volumeInfo.getTitle() != null ? volumeInfo.getTitle() : "");
            builder.authors(volumeInfo.getAuthors() != null ? volumeInfo.getAuthors() : List.of());
            builder.publisher(volumeInfo.getPublisher() != null ? volumeInfo.getPublisher() : "");
            builder.publishedDate(volumeInfo.getPublishedDate() != null ? volumeInfo.getPublishedDate() : "");
            builder.description(volumeInfo.getDescription() != null ? volumeInfo.getDescription() : "");
            builder.pageCount(volumeInfo.getPageCount() != null ? volumeInfo.getPageCount() : 0);
            builder.categories(volumeInfo.getCategories() != null ? volumeInfo.getCategories() : List.of());
            builder.language(volumeInfo.getLanguage() != null ? volumeInfo.getLanguage() : "en");
            builder.previewLink(volumeInfo.getPreviewLink() != null ? volumeInfo.getPreviewLink() : "");
            
            // Rating info
            builder.averageRating(volumeInfo.getAverageRating() != null ? volumeInfo.getAverageRating() : 0.0);
            builder.maturityRating(volumeInfo.getMaturityRating());
            
            // Thumbnail
            ImageLinks imageLinks = volumeInfo.getImageLinks();
            if (imageLinks != null) {
                String thumbnail = imageLinks.getThumbnail();
                if (thumbnail != null) {
                    // Convert http to https for security
                    thumbnail = thumbnail.replace("http://", "https://");
                }
                builder.thumbnail(thumbnail);
            }
            
            return builder.build();
            
        } catch (Exception e) {
            System.out.println("Failed to convert Item to BookDTO for ID " + item.getId() + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Empty response helper
     */
    private PagedBookResponseDTO emptyPagedResponse(int page, int pageSize) {
        return PagedBookResponseDTO.builder()
                .page(page)
                .pageSize(pageSize)
                .totalItems(0)
                .hasNextPage(false)
                .searchId(null)
                .books(Collections.emptyList())
                .build();
    }

    /**
     * Build query based on search type
     */
    private String buildQuery(String query, String type) {
        if (query == null || query.isBlank()) return "";

        query = query.trim();

        return switch (type.toLowerCase()) {
            case "title"  -> "intitle:" + query;
            case "author" -> "inauthor:" + query;
            case "isbn"   -> "isbn:" + query.replaceAll("[^0-9Xx]", "");
            case "general" -> query;
            default -> query;
        };
    }
}