// WHY IS GET BY ID BROKEN????

package com.bookbuddy.client;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPIByIdResponse;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPISearchResponse;
import com.bookbuddy.exception.GoogleBookAPIException;


@Component
public class GoogleBookAPI {

    @Value("${google.api.key}")
    private String googleApiKey;
    private final WebClient webClient;


    // Spring automatically provides a WebClient.Builder
    public GoogleBookAPI(WebClient.Builder webClientBuilder) {
        // Set the base URL once — cleaner for reuse
        this.webClient = webClientBuilder
                .baseUrl("https://www.googleapis.com/books/v1/volumes")
                .build();
    }

    public BookDTO getGoogleBookById(String googleBooksId) {
        try {
            GoogleBookAPIByIdResponse response;

            // Try the PUBLIC endpoint first (no API key)
            try {
                response = webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/{id}")
                                .queryParam("langRestrict", "en") // force English edition
                                .build(googleBooksId))
                        .retrieve()
                        .bodyToMono(GoogleBookAPIByIdResponse.class)
                        .block();

                System.out.println("Requesting Google Books URL (public): " + response);

                if (response == null || response.getVolumeInfo() == null) {
                    throw new GoogleBookAPIException("No book found for ID: " + googleBooksId);
                }

            } catch (WebClientResponseException e) {
                // Fallback to API key if public request fails
                if (e.getStatusCode().is4xxClientError() || e.getStatusCode().is5xxServerError()) {

                    response = webClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/{id}")
                                    .queryParam("key", googleApiKey)
                                    .build(googleBooksId))
                            .retrieve()
                            .bodyToMono(GoogleBookAPIByIdResponse.class)
                            .block();

                    System.out.println("Requesting Google Books URL (API key): " + response);

                } else {
                    throw e; // unexpected error
                }
            }

            // Final check
            if (response == null || response.getVolumeInfo() == null) {
                throw new GoogleBookAPIException("No book found for ID: " + googleBooksId);
            }

            // Map Google API response → BookDTO safely
            GoogleBookAPIByIdResponse.VolumeInfo info = response.getVolumeInfo();

            return BookDTO.builder()
                    .googleBooksId(response.getId())
                    .title(info.getTitle() != null ? info.getTitle() : "")
                    .authors(info.getAuthors() != null ? info.getAuthors() : List.of())
                    .publisher(info.getPublisher() != null ? info.getPublisher() : "")
                    .publishedDate(info.getPublishedDate() != null ? info.getPublishedDate() : "")
                    .description(info.getDescription() != null ? info.getDescription() : "")
                    .pageCount(info.getPageCount() != null ? info.getPageCount() : 0)
                    .categories(info.getCategories() != null ? info.getCategories() : List.of())
                    .averageRating(info.getAverageRating() != null ? info.getAverageRating() : 0.0)
                    .maturityRating(info.getMaturityRating())
                    .thumbnail(info.getImageLinks() != null ? info.getImageLinks().getThumbnail() : null)
                    .language(info.getLanguage() != null ? info.getLanguage() : "en")
                    .previewLink(info.getPreviewLink() != null ? info.getPreviewLink() : "")
                    .build();

        } catch (WebClientResponseException e) {
            throw new GoogleBookAPIException("Google Books API error: " + e.getStatusCode());
        } catch (Exception e) {
            throw new GoogleBookAPIException("Failed to fetch book from Google API: " + e.getMessage());
        }
    }

    public GoogleBookAPISearchResponse rawSearch(String query, int startIndex, int maxResults) {
        try {
            return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("q", query)
                        .queryParam("startIndex", startIndex)
                        .queryParam("maxResults", Math.min(maxResults, 40)) // Google API limit
                    .queryParam("printType", "books")      // only books, no magazines
                    .queryParam("orderBy", "relevance")    // sort by relevance
                    .queryParam("langRestrict", "en")      // English only
                        .build())
                .retrieve()
                .bodyToMono(GoogleBookAPISearchResponse.class)
                .block();
        } catch (Exception e) {
            throw new GoogleBookAPIException("Failed to fetch books: " + e.getMessage());
        }
    }
}