package com.bookbuddy.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPISearchResponse;
import com.bookbuddy.dto.GoogleBookAPIDTO.PagedBookResponseDTO;

@Service
public class BookSearchService {

    private final GoogleBookAPI googleBookAPI;

    public BookSearchService(GoogleBookAPI googleBookAPI) {
        this.googleBookAPI = googleBookAPI;
    }

    public PagedBookResponseDTO searchBooks(String query) {
        return searchBooksPaged(query, "general", 1, 5);
    }

    public PagedBookResponseDTO searchBooksPaged(String query, String type, int page, int pageSize) {
        String formattedQuery = buildQuery(query, type);
        
        int startIndex = (page - 1) * pageSize;
        int remaining = pageSize;
        List<BookDTO> books = new ArrayList<>();

        // First API call to get totalItems
        GoogleBookAPISearchResponse firstResponse = googleBookAPI.rawSearch(formattedQuery, startIndex, Math.min(remaining, 40));
        int totalItems = (firstResponse != null) ? firstResponse.getTotalItems() : 0;

        if (firstResponse != null && firstResponse.getItems() != null) {
            books.addAll(mapItemsToBookDTO(firstResponse.getItems()));
            remaining -= firstResponse.getItems().size();
            startIndex += firstResponse.getItems().size();
}

        // Loop to accumulate more results if needed (for pageSize > per-request limit)
        while (remaining > 0) {
            int fetch = Math.min(remaining, 40);
            GoogleBookAPISearchResponse response = googleBookAPI.rawSearch(formattedQuery, startIndex, fetch);

            if (response == null || response.getItems() == null || response.getItems().isEmpty()) break;

            books.addAll(mapItemsToBookDTO(response.getItems()));
            remaining -= response.getItems().size();
            startIndex += response.getItems().size();
        }

        // Rank books by relevance before returning
        List<BookDTO> rankedBooks = BookSearchRanker.rankBooks(books, query, type);

        return PagedBookResponseDTO.builder()
                .page(page)
                .pageSize(pageSize)
                .totalItems(totalItems)
                .books(rankedBooks)
                .build();
    }
   
    // Understanding search type requested
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

    // Helper method
    private List<BookDTO> mapItemsToBookDTO(List<GoogleBookAPISearchResponse.Item> items) {
        return items.stream()
                .map(item -> {
                    var info = item.getVolumeInfo();
                    if (info == null) return (BookDTO) null; // explicit cast fixes type issue
                    return BookDTO.builder()
                            .googleBooksId(item.getId())
                            .title(info.getTitle())
                            .authors(info.getAuthors())
                            .publisher(info.getPublisher())
                            .publishedDate(info.getPublishedDate())
                            .description(info.getDescription())
                            .categories(info.getCategories())
                            .averageRating(info.getAverageRating())
                            .thumbnail(info.getImageLinks() != null ? info.getImageLinks().getThumbnail() : null)
                            .previewLink(info.getPreviewLink())
                            .build();
                })
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

}



   


