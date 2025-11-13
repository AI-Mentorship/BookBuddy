package com.bookbuddy.controller;

import com.bookbuddy.dto.GenrePreferenceRequest;
import com.bookbuddy.dto.GenrePreferenceResponse;
import com.bookbuddy.service.GenrePreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("genre-preference")
@CrossOrigin(origins = "${frontend.url}")
public class GenrePreferenceController {

    private GenrePreferenceService genrePreferenceService;

    public GenrePreferenceController(GenrePreferenceService genrePreferenceService){
        this.genrePreferenceService = genrePreferenceService;
    }


    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveGenrePreference(@RequestBody GenrePreferenceRequest genrePreferenceRequest) {
        genrePreferenceService.saveGenrePreference(genrePreferenceRequest);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @GetMapping("/saved-genres/{userId}")
    public ResponseEntity<List<GenrePreferenceResponse>> getSavedGenres(@PathVariable Long userId) {
        List <GenrePreferenceResponse> listOfGenres = genrePreferenceService.getSavedGenres(userId);
        return ResponseEntity.ok(listOfGenres);
    }

}
