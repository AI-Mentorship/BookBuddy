package com.bookbuddy.service;

import com.bookbuddy.dto.GenrePreferenceDTO.GenrePreferenceRequest;
import com.bookbuddy.dto.GenrePreferenceDTO.GenrePreferenceResponse;
import com.bookbuddy.model.GenrePreference;
import com.bookbuddy.model.User;
import com.bookbuddy.repository.GenrePreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class GenrePreferenceService {

    private GenrePreferenceRepository genrePreferenceRepository;
    private UserService userService;


    @Autowired
    public GenrePreferenceService(GenrePreferenceRepository genrePreferenceRepository, UserService userService) {
        this.genrePreferenceRepository = genrePreferenceRepository;
        this.userService = userService;
    }

    @Transactional
    public void saveGenrePreference(GenrePreferenceRequest genrePreferenceRequest) {
        Long userId = genrePreferenceRequest.getUserId();
        User user = userService.getUserById(userId);

        List<String> genres = genrePreferenceRequest.getGenre();
        if (genres == null || genres.isEmpty()) {
            // If empty, just delete all existing preferences
            genrePreferenceRepository.deleteByUser(user);
            genrePreferenceRepository.flush(); // Ensure delete is committed
            return;
        }

        // OPTIMIZED: Direct delete query instead of fetch-then-delete
        genrePreferenceRepository.deleteByUser(user);
        genrePreferenceRepository.flush(); // Ensure delete is committed before inserting new ones

        // Build new preferences list
        List<GenrePreference> user_genre = new ArrayList<>();
        for (String genre : genres) {
            if (genre != null && !genre.trim().isEmpty()) {
                user_genre.add(GenrePreference.builder()
                        .user(user)
                        .genreName(genre.trim())
                        .build());
            }
        }

        // Save all new preferences in one batch
        if (!user_genre.isEmpty()) {
            List<GenrePreference> saved = genrePreferenceRepository.saveAll(user_genre);
            genrePreferenceRepository.flush(); // Ensure save is committed
            System.out.println("Saved " + saved.size() + " genre preferences for user " + userId);
        } else {
            System.out.println("No valid genres to save for user " + userId);
        }
    }

    @Transactional(readOnly = true)
    public List<GenrePreferenceResponse> getSavedGenres(Long userId) {
        User user = userService.getUserById(userId);
        List <GenrePreference> genre_preferences = genrePreferenceRepository.findByUser(user);
        List <GenrePreferenceResponse> genre_response = new ArrayList<>();

        for(GenrePreference genre_preference : genre_preferences) {
            genre_response.add(
                    GenrePreferenceResponse.builder().
                            genre(genre_preference.getGenreName()).
                            build()
            );
        }

        return genre_response;
    }
}
