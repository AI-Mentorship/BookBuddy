package com.bookbuddy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookbuddy.dto.GoogleBookAPIDTO.PagedBookResponseDTO;
import com.bookbuddy.service.BookSearchService;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*") // We may need this for frontend 
public class BookSearchController {

    private final BookSearchService bookSearchService;

    public BookSearchController(BookSearchService bookSearchService) {
        this.bookSearchService = bookSearchService;
    }

    /**
     * Endpoint: /api/books/search?q=harry+potter
     * Always returns up to 20 results (auto-paged).
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(
        @RequestParam("q") String query,
        @RequestParam(value = "type", defaultValue = "general") String type,
        @RequestParam(value = "page", defaultValue = "1") int page) {
            
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Query parameter 'q' cannot be empty.");
        }

        // Fixed page size = 20
        final int PAGE_SIZE = 20;
        PagedBookResponseDTO results = bookSearchService.searchBooksPaged(query.trim(), type, page, PAGE_SIZE);
        return ResponseEntity.ok(results);
    }

    // Full Endpoint: /api/books/search/compact?q=harry+potter
    @GetMapping("/search/compact")
    public ResponseEntity<?> searchBooksCompact(
            @RequestParam("q") String query,
            @RequestParam(value = "type", defaultValue = "general") String type,
            @RequestParam(value = "page", defaultValue = "1") int page
    ) {
        final int PAGE_SIZE = 10;
        PagedBookResponseDTO results = bookSearchService.searchBooksPaged(query.trim(), type, page, PAGE_SIZE);
        return ResponseEntity.ok(results);
    }
}