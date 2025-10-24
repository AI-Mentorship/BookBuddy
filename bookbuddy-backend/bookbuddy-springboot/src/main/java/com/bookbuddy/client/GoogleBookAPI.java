package com.bookbuddy.client;

import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.dto.GoogleBookAPIResponse;
import com.bookbuddy.exception.GoogleBookAPIException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

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
            GoogleBookAPIResponse response;

            // Try the PUBLIC endpoint first (no API key)
            try {
                response = webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/{id}")                   // dynamic path variable for the book ID
                                .build(googleBooksId))           // build URI like https://www.googleapis.com/books/v1/volumes/{id}
                        .retrieve()
                        .bodyToMono(GoogleBookAPIResponse.class)
                        .block();

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
                            .bodyToMono(GoogleBookAPIResponse.class) // convert the JSON body to a GoogleBookAPIResponse object
                            .block();                             // make the call synchronous (blocks until response arrives)
                } else {
                    throw e; // rethrow if it’s some other unexpected status
                }
            }

            //Convert Google API response → your internal BookDTO
            if (response == null || response.getVolumeInfo() == null) {
                throw new GoogleBookAPIException("No book found for ID: " + googleBooksId);
            }

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
                    .thumbnail(response.getVolumeInfo().getImageLinks().getThumbnail())
                    .language(response.getVolumeInfo().getLanguage())
                    .previewLink(response.getVolumeInfo().getPreviewLink())
                    .build();

        } catch (WebClientResponseException e) {
            // Handles HTTP errors returned directly from the Google Books API (e.g., 404, 500)
            throw new GoogleBookAPIException("Google Books API error: " + e.getStatusCode());
        } catch (Exception e) {
            // Handles any other unexpected errors (e.g., network issues, parsing errors)
            throw new GoogleBookAPIException("Failed to fetch book from Google API: " + e.getMessage());
        }
    }
}

/*

 */