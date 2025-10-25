package com.bookbuddy.service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.dto.GoogleBookAPISearchResponse;
import com.bookbuddy.dto.PagedBookResponseDTO;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class BookSearchService {

    private final GoogleBookAPI googleBookAPI;

    public BookSearchService(GoogleBookAPI googleBookAPI) {
        this.googleBookAPI = googleBookAPI;
    }

    public PagedBookResponseDTO searchBooks(String query) {
        return searchBooksPaged(query, 1, 20);
    }

    public PagedBookResponseDTO searchBooksPaged(String query, int page, int pageSize) {
        int startIndex = (page - 1) * pageSize;
        int remaining = pageSize;
        List<BookDTO> books = new ArrayList<>();

        // First API call to get totalItems
        GoogleBookAPISearchResponse firstResponse = googleBookAPI.rawSearch(query, startIndex, Math.min(remaining, 40));
        int totalItems = firstResponse.getTotalItems();

        if (firstResponse.getItems() != null) {
            books.addAll(mapItemsToBookDTO(firstResponse.getItems()));
            remaining -= firstResponse.getItems().size();
            startIndex += firstResponse.getItems().size();
        }

        // Loop to accumulate more results if needed (for pageSize > per-request limit)
        while (remaining > 0) {
            int fetch = Math.min(remaining, 40);
            GoogleBookAPISearchResponse response = googleBookAPI.rawSearch(query, startIndex, fetch);

            if (response.getItems() == null || response.getItems().isEmpty()) break;

            books.addAll(mapItemsToBookDTO(response.getItems()));
            remaining -= response.getItems().size();
            startIndex += response.getItems().size();
        }

        return PagedBookResponseDTO.builder()
                .page(page)
                .pageSize(pageSize)
                .totalItems(totalItems)
                .books(books)
                .build();
    }

    // Helper method
    private List<BookDTO> mapItemsToBookDTO(List<GoogleBookAPISearchResponse.Item> items) {
        return items.stream()
                .map(item -> {
                    var info = item.getVolumeInfo();
                    if (info == null) return null;
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
                .toList();
    }


}
