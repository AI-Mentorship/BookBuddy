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
            @RequestParam("userId") Long userId,
            @RequestParam("q") String query,
            @RequestParam(value = "type", defaultValue = "general") String type,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "pageSize", defaultValue = "20") int pageSize,
            @RequestParam(value = "searchId", required = false) String searchId
    ) {
        PagedBookResponseDTO results = bookSearchService.searchBooksPaged(userId, query, type, page, pageSize, searchId);
        return ResponseEntity.ok(results);
    }


}