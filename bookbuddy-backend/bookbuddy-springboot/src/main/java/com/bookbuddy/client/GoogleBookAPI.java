package com.bookbuddy.client;

import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.dto.GoogleBookAPIByIdResponse;
import com.bookbuddy.exception.GoogleBookAPIException;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class GoogleBookAPI {

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
            GoogleBookAPIByIdResponse response = webClient.get().
                    uri("/{id}", googleBooksId)// dynamic path variable
                    .retrieve()// send request and prepare to handle response
                    .bodyToMono(GoogleBookAPIByIdResponse.class) // convert JSON to String
                    .block(); //makes this sync and not async (not good for scaling)

            if (response == null || response.getVolumeInfo() == null) {
                throw new GoogleBookAPIException("No book found for ID: " + googleBooksId);
            }

            // Convert Google API response -> your internal BookDTO
            return BookDTO.builder().
                    googleBooksId(response.getId()).
                    title(response.getVolumeInfo().getTitle()).
                    authors(response.getVolumeInfo().getAuthors()).
                    publisher(response.getVolumeInfo().getPublisher()).
                    publishedDate(response.getVolumeInfo().getPublishedDate()).
                    description(response.getVolumeInfo().getDescription()).
                    pageCount(response.getVolumeInfo().getPageCount()).
                    categories(response.getVolumeInfo().getCategories()).
                    averageRating(response.getVolumeInfo().getAverageRating()).
                    maturityRating(response.getVolumeInfo().getMaturityRating()).
                    thumbnail(response.getVolumeInfo().getImageLinks().getThumbnail()).
                    language(response.getVolumeInfo().getLanguage()).
                    previewLink(response.getVolumeInfo().getPreviewLink()).
                    build();
        } catch (WebClientResponseException e) {
            // Handles HTTP errors returned directly from the Google Books API (e.g., 404, 500)
            throw new GoogleBookAPIException("Google Books API error: " + e.getStatusCode());
        } catch (Exception e) {
            // Handles any other unexpected errors (e.g., network issues, parsing errors)
            throw new GoogleBookAPIException("Failed to fetch book from Google API: " + e.getMessage());
        }

    }


}