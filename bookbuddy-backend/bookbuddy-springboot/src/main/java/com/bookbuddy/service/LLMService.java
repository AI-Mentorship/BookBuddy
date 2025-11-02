package com.bookbuddy.service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.*;
import com.bookbuddy.exception.MLServiceException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class LLMService {
    private final SavedBookService savedBookService;
    private final ReadBookService readBookService;
    private final GenrePreferenceService genrePreferenceService;
    private final GoogleBookAPI googleBookAPI;
    private final RestTemplate restTemplate;
    private static final String ML_URL = "http://localhost:8000/ml/recommendations";


    public LLMService(SavedBookService savedBookService, ReadBookService readBookService, GenrePreferenceService genrePreferenceService, GoogleBookAPI googleBookAPI, RestTemplate restTemplate) {
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

        return LLMRequest.builder().
                savedBookData(savedBookData).
                readBookData(readBookData).
                genrePreferenceData(genrePreferenceData).
                build();
    }

    public LLMResponse fetchRecommendationIdsFromML(LLMRequest llmRequest) {
        /*
         * Sends the LLMRequest JSON to the ML model via POST.
         *
         * Example ML response:
         * {
         *   "recommendedBooks": [
         *     "HFHD898",
         *     "KDHJD736"
         *   ]
         * }
         *
         * POST is used because the ML service computes recommendations dynamically
         * based on the input; nothing is pre-stored.
         */
        try {
            LLMResponse response = restTemplate.postForObject(
                    ML_URL,          // URL of your ML service
                    llmRequest,      // The body you’re sending
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


    public List <BookDTO> getRecommendedBooks(LLMResponse llmResponse) {
        List <String> recommendedBookIds = llmResponse.getRecommendedBookIds();
        List<BookDTO> recommendedBooks = new ArrayList<>();
        for(String recommendedBookId : recommendedBookIds){
            BookDTO bookDetail = googleBookAPI.getGoogleBookById(recommendedBookId);
            recommendedBooks.add(bookDetail);
        }

        return recommendedBooks;
    }
}

