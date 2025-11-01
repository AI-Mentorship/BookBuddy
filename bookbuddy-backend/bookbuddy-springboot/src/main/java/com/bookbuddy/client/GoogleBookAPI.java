// Hamza Rafeeq 1111

package com.bookbuddy.client;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.dto.GoogleBookAPIByIdResponse;
import com.bookbuddy.dto.GoogleBookAPISearchResponse;
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
                                .path("/{id}")                   // dynamic path variable for the book ID
                                .build(googleBooksId))           // build URI like https://www.googleapis.com/books/v1/volumes/{id}
                        .retrieve()
                        .bodyToMono(GoogleBookAPIByIdResponse.class)
                        .block();

                System.out.println("Requesting Google Books URL: " + response);


                if (response == null || response.getVolumeInfo() == null) {
                    throw new GoogleBookAPIException("No book found for ID: " + googleBooksId);
                }

            } catch (WebClientResponseException e) {
                // If the public endpoint fails (e.g., quota exceeded), fallback to using the API key
                if (e.getStatusCode().is4xxClientError() || e.getStatusCode().is5xxServerError()) {
                    System.out.println("Public Google Books API failed, retrying with API key...");

                    response = webClient.get()
                            // Build the request URI dynamically
                            .uri(uriBuilder -> uriBuilder
                                    .path("/{id}")                // dynamic path variable for the book ID
                                    .queryParam("key", googleApiKey) // append ?key=YOUR_API_KEY as query parameter
                                    .build(googleBooksId))        // replace {id} with actual Google Books ID
                            .retrieve()                           // send the GET request and prepare to handle the response
                            .bodyToMono(GoogleBookAPIByIdResponse.class) // convert the JSON body to a GoogleBookAPIResponse object
                            .block();                             // make the call synchronous (blocks until response arrives)

                    System.out.println("Requesting Google Books URL: " + response);
                } else {
                    throw e; // rethrow if it’s some other unexpected status
                }
            }

            //Convert Google API response → your internal BookDTO
            if (response == null || response.getVolumeInfo() == null) {
                throw new GoogleBookAPIException("No book found for ID: " + googleBooksId);
            }

            // Replace the BookDTO.builder() section in getGoogleBookById with:
            return BookDTO.builder()
                    .googleBooksId(response.getId())
                    .title(response.getVolumeInfo().getTitle())
                    .authors(response.getVolumeInfo().getAuthors())
                    .publisher(response.getVolumeInfo().getPublisher())
                    .publishedDate(response.getVolumeInfo().getPublishedDate())
                    .description(response.getVolumeInfo().getDescription())
                    .pageCount(response.getVolumeInfo().getPageCount())
                    .categories(response.getVolumeInfo().getCategories())
                    .averageRating(response.getVolumeInfo().getAverageRating())
                    .maturityRating(response.getVolumeInfo().getMaturityRating())
                    .thumbnail(response.getVolumeInfo().getImageLinks() != null
                            ? response.getVolumeInfo().getImageLinks().getThumbnail()
                            : null) // <-- Added null check
                    .language(response.getVolumeInfo().getLanguage())
                    .previewLink(response.getVolumeInfo().getPreviewLink())
                    .build();

        } catch (WebClientResponseException e) {
            // Handles HTTP errors returned directly from the Google Bocd friooks API (e.g., 404, 500)
            throw new GoogleBookAPIException("Google Books API error: " + e.getStatusCode());
        } catch (Exception e) {
            // Handles any other unexpected errors (e.g., network issues, parsing errors)
            throw new GoogleBookAPIException("Failed to fetch book from Google API: " + e.getMessage());
        }
    }

    public List<BookDTO> searchBooks(String query, int startIndex, int maxResults) {
        try {
            GoogleBookAPISearchResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("q", query)
                            .queryParam("startIndex", startIndex)
                            .queryParam("maxResults", maxResults) // limit results if wanted
                            .build())
                    .retrieve()
                    .bodyToMono(GoogleBookAPISearchResponse.class)
                    .block();
                
            // where response is empty or invalid
            if (response == null || response.getItems() == null) {
                throw new GoogleBookAPIException("No results found for query: " + query);
            }

            // Map each Google result → BookDTO
            return response.getItems().stream()
                    .map(item -> {
                        GoogleBookAPISearchResponse.VolumeInfo info = item.getVolumeInfo();
                        if (info == null) return null;
                        return BookDTO.builder()
                                .googleBooksId(item.getId())
                                .title(info.getTitle())
                                .authors(info.getAuthors())
                                .publisher(info.getPublisher())
                                .publishedDate(info.getPublishedDate())
                                .description(info.getDescription())
                                .pageCount(info.getPageCount())
                                .categories(info.getCategories())
                                .averageRating(info.getAverageRating())
                                .maturityRating(info.getMaturityRating())
                                .thumbnail(info.getImageLinks() != null ? info.getImageLinks().getThumbnail() : null)
                                .language(info.getLanguage())
                                .previewLink(info.getPreviewLink())
                                .build();
                    })
                    .filter(dto -> dto != null)
                    .toList();

        } catch (WebClientResponseException e) {
            // if there is http errors: invalid id, API key issues
            throw new GoogleBookAPIException("Google Books API error: " + e.getStatusCode());
        } catch (Exception e) {
            // runtime error: network, parsing
            throw new GoogleBookAPIException("Failed to search books: " + e.getMessage());
        }

    }

    public GoogleBookAPISearchResponse rawSearch(String query, int startIndex, int maxResults) {
        try {
            return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("q", query)
                        .queryParam("startIndex", startIndex)
                        .queryParam("maxResults", Math.min(maxResults, 40)) // Google API limit
                        .build())
                .retrieve()
                .bodyToMono(GoogleBookAPISearchResponse.class)
                .block();
        } catch (Exception e) {
            throw new GoogleBookAPIException("Failed to fetch books: " + e.getMessage());
        }
    }
}