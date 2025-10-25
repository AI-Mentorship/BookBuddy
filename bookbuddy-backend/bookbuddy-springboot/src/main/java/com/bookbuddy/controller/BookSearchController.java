package com.bookbuddy.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.service.BookSearchService;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*") // We may need this for frontend 
public class BookSearchController {

    private final BookSearchService bookSearchService;

    public BookSearchController(BookSearchService bookSearchService) {
        this.bookSearchService = bookSearchService;
    }

    @GetMapping("/search")
    public List<BookDTO> searchBooks(@RequestParam("q") String query) {
        return bookSearchService.searchBooks(query);
    }
}
