package com.bookbuddy.service;

import com.bookbuddy.dto.GenrePreferenceRequest;
import com.bookbuddy.dto.GenrePreferenceResponse;
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

        List<String> genres = genrePreferenceRequest.getGenres();
        if (genres == null || genres.isEmpty()) {
            // Nothing to save — exit early
            return;
        }

        // DELETE all existing genre preferences for this user first
        genrePreferenceRepository.deleteByUser(user);

        // NOW save the new genres
        List<GenrePreference> user_genre = new ArrayList<>();

        for (String genre : genres) {
            user_genre.add(GenrePreference.builder()
                    .user(user)
                    .genreName(genre)
                    .build());
        }

        genrePreferenceRepository.saveAll(user_genre);
    }
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

