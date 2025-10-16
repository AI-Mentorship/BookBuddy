package com.bookbuddy.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookbuddy.model.SavedBooks;
import com.bookbuddy.model.User;
import com.bookbuddy.service.SavedBooksService;

@RestController
@RequestMapping("/saved-books")
public class SavedBooksController {

    private final SavedBooksService savedBooksService;

    @Autowired
    public SavedBooksController(SavedBooksService savedBooksService) {
        this.savedBooksService = savedBooksService;
    }

    // Get all saved books (for testing)
    @GetMapping
    public ResponseEntity<List<SavedBooks>> getAllSavedBooks() {
        List<SavedBooks> savedBooks = savedBooksService.getAllSavedBooks();
        return ResponseEntity.ok(savedBooks);
    }

    // Get saved books for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedBooks>> getSavedBooksByUserId(@PathVariable Long userId) {
        List<SavedBooks> savedBooks = savedBooksService.getSavedBooksByUserId(userId);

        if (savedBooks.isEmpty()) {
            // You can choose 204 (no content) or 200 with empty array
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(savedBooks);
    }
}