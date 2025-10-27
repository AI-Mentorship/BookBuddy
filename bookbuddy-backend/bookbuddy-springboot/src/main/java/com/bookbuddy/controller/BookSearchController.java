package com.bookbuddy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookbuddy.dto.PagedBookResponseDTO;
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
        @RequestParam(value = "page", defaultValue = "1") int page) {
            
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Query parameter 'q' cannot be empty.");
        }

        // Fixed page size = 20
        PagedBookResponseDTO results = bookSearchService.searchBooksPaged(query.trim(), page, 20);
        return ResponseEntity.ok(results);
    }

    // Endpoint: /api/books/search/compact?q=harry+potter
    @GetMapping("/search/compact")
    public ResponseEntity<?> searchBooksCompact(@RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Query parameter 'q' cannot be empty.");
        }
        
        // adjustable number of books returned, currently: 5
        // modify "searchBooks" in service
        PagedBookResponseDTO results = bookSearchService.searchBooks(query.trim());
        return ResponseEntity.ok(results);
    }

}

    

