package com.bookbuddy.controller;

import com.bookbuddy.dto.GenrePreferenceDTO.GenrePreferenceRequest;
import com.bookbuddy.dto.GenrePreferenceDTO.GenrePreferenceResponse;
import com.bookbuddy.service.GenrePreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("genre-preference")
@CrossOrigin(origins = "http://localhost:5173") // your frontend URL
public class GenrePreferenceController {

    private GenrePreferenceService genrePreferenceService;

    public GenrePreferenceController(GenrePreferenceService genrePreferenceService){
        this.genrePreferenceService = genrePreferenceService;
    }


    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveGenrePreference(@RequestBody GenrePreferenceRequest genrePreferenceRequest) {
        try {
            System.out.println("Received genre preference request for userId: " + genrePreferenceRequest.getUserId());
            System.out.println("Genres to save: " + genrePreferenceRequest.getGenre());
            
            genrePreferenceService.saveGenrePreference(genrePreferenceRequest);
            
            System.out.println("Successfully saved genre preferences for userId: " + genrePreferenceRequest.getUserId());
            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            System.err.println("Error saving genre preferences: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping("/saved-genres/{userId}")
    public ResponseEntity<List<GenrePreferenceResponse>> getSavedGenres(@PathVariable Long userId) {
        List <GenrePreferenceResponse> listOfGenres = genrePreferenceService.getSavedGenres(userId);
        return ResponseEntity.ok(listOfGenres);
    }

}
