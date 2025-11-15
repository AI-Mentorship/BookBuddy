package com.bookbuddy.service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.GenrePreferenceDTO.GenrePreferenceResponse;
import com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO;
import com.bookbuddy.dto.LLMDTO.LLMRequest;
import com.bookbuddy.dto.LLMDTO.LLMResponse;
import com.bookbuddy.dto.LLMDTO.ValidationRequest;
import com.bookbuddy.dto.LLMDTO.ValidationResponse;
import com.bookbuddy.dto.ReadBookDTO.GetReadBookResponse;
import com.bookbuddy.exception.MLServiceException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LLMService {
    private final SavedBookService savedBookService;
    private final ReadBookService readBookService;
    private final GenrePreferenceService genrePreferenceService;
    private final GoogleBookAPI googleBookAPI;
    private final RestTemplate restTemplate;
    private static final String ML_URL = "http://localhost:8000/ml/recommendations";
    private static final String ML_VALIDATION_URL = "http://localhost:8000/ml/validate-books";


    public LLMService(SavedBookService savedBookService, ReadBookService readBookService,
                      GenrePreferenceService genrePreferenceService, GoogleBookAPI googleBookAPI,
                      RestTemplate restTemplate) {
        this.savedBookService = savedBookService;
        this.readBookService = readBookService;
        this.genrePreferenceService = genrePreferenceService;
        this.googleBookAPI = googleBookAPI;
        this.restTemplate = restTemplate;
    }

    public LLMRequest processLLMRequest(Long userId) {
        List<BookDTO> savedBookData = savedBookService.getSavedBooksByUserId(userId);
        List<GetReadBookResponse> readBookData = readBookService.getReadBooksByUserId(userId);
        List<GenrePreferenceResponse> genrePreferenceData = genrePreferenceService.getSavedGenres(userId);

        return LLMRequest.builder()
                .savedBookData(savedBookData)
                .readBookData(readBookData)
                .genrePreferenceData(genrePreferenceData)
                .build();
    }

    public LLMResponse fetchRecommendationIdsFromML(LLMRequest llmRequest) {
        /*
         * Sends the LLMRequest JSON to the ML model via POST to get book recommendations.
         *
         * ===== WHAT ML RECEIVES (Example Request Body) =====
         * {
         *   "savedBookData": [
         *     {
         *       "id": "BOOK123",
         *       "title": "The Great Gatsby",
         *       "authors": ["F. Scott Fitzgerald"],
         *       ...
         *     }
         *   ],
         *   "readBookData": [
         *     {
         *       "bookId": "BOOK456",
         *       "rating": 5,
         *       ...
         *     }
         *   ],
         *   "genrePreferenceData": [
         *     {
         *       "genre": "Fiction",
         *       "preferenceLevel": "high"
         *     }
         *   ]
         * }
         *
         * ===== WHAT ML RETURNS (Example Response) =====
         * {
         *   "recommendedBookIds": [
         *     "HFHD898",
         *     "KDHJD736",
         *     "XYZABC123"
         *   ]
         * }
         *
         * POST is used because the ML service computes recommendations dynamically
         * based on the input; nothing is pre-stored.
         */
        try {
            LLMResponse response = restTemplate.postForObject(
                    ML_URL,          // URL of your ML service
                    llmRequest,      // The body you're sending
                    LLMResponse.class // The expected response type
            );

            // Check if ML returned a valid response
            if (response == null) {
                throw new MLServiceException("ML service returned no recommendations");
            }

            return response;

        } catch (RestClientException e) {
            // Wrap network or HTTP errors into a custom exception
            throw new MLServiceException("Failed to fetch recommendations from ML service", e);
        }
    }

    public List<BookDTO> getRecommendedBooks(LLMResponse llmResponse) {
        List<String> recommendedBookIds = llmResponse.getRecommendedBookIds();

        // Validate book IDs with ML service before fetching from Google Books API
        ValidationResponse validationResponse = validateBookIds(recommendedBookIds);

        // Filter to only keep valid book IDs (where validation returned true)
        List<String> validBookIds = recommendedBookIds.stream()
                .filter(bookId -> validationResponse.getValidationResults().getOrDefault(bookId, false))
                .collect(Collectors.toList());

        // Fetch book details only for validated IDs
        List<BookDTO> recommendedBooks = new ArrayList<>();
        for (String validBookId : validBookIds) {
            BookDTO bookDetail = googleBookAPI.getGoogleBookById(validBookId);
            recommendedBooks.add(bookDetail);
        }

        return recommendedBooks;
    }

    /**
     * PUBLIC method to validate Google Books IDs against the ML service.
     * This is used by:
     * 1. getRecommendedBooks() - to validate recommendation results
     * 2. Search functionality - to ensure search results return only valid books
     *
     * @param bookIds List of Google Books IDs to validate
     * @return ValidationResponse containing validation results for each book ID
     */
    public ValidationResponse validateBookIds(List<String> bookIds) {
        /*
         * Validates Google Books IDs with the ML service via POST.
         *
         * ===== WHAT ML RECEIVES (Example Request Body) =====
         * {
         *   "bookIds": [
         *     "HFHD898",
         *     "KDHJD736",
         *     "XYZABC123"
         *   ]
         * }
         *
         * ===== WHAT ML RETURNS (Example Response) =====
         * {
         *   "HFHD898": true,
         *   "KDHJD736": true,
         *   "XYZABC123": false
         * }
         *
         * The ML service checks if each Google Books ID is valid/exists.
         * Returns a flat JSON object where each key is a book ID and value is validity.
         */
        try {
            ValidationRequest request = ValidationRequest.builder()
                    .bookIds(bookIds)
                    .build();

            ValidationResponse response = restTemplate.postForObject(
                    ML_VALIDATION_URL,
                    request,
                    ValidationResponse.class
            );

            if (response == null || response.getValidationResults() == null) {
                throw new MLServiceException("ML validation service returned null or invalid response");
            }

            return response;

        } catch (RestClientException e) {
            throw new MLServiceException("Failed to validate book IDs with ML service", e);
        }
    }

    /**
     * Helper method for search functionality.
     * Validates a list of book IDs and returns only the IDs that are valid (true).
     *
     * @param bookIds List of Google Books IDs to validate
     * @return List of only valid book IDs (where validation returned true)
     */
    public List<String> getValidBookIds(List<String> bookIds) {
        // Validate book IDs with ML service
        ValidationResponse validationResponse = validateBookIds(bookIds);

        // Filter and return only book IDs where validation is true
        return bookIds.stream()
                .filter(bookId -> validationResponse.getValidationResults().getOrDefault(bookId, false))
                .collect(Collectors.toList());
    }
}