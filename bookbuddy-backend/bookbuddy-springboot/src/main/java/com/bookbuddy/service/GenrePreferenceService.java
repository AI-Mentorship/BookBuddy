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

    public void saveGenrePreference(GenrePreferenceRequest genrePreferenceRequest) {
        Long userId = genrePreferenceRequest.getUserId();
        User user = userService.getUserById(userId);

        //using save all means we need a list of the entity, we will save all of it

        List<GenrePreference> user_genre = new ArrayList<>();

        List<String> genres = genrePreferenceRequest.getGenre();
        if (genres == null || genres.isEmpty()) {
            // Nothing to save — exit early
            return;
        }

        for (String genre : genres) {
            user_genre.add(GenrePreference.builder().
                    user(user).
                    genreName(genre).
                    build());
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

