package com.bookbuddy.controller;

import java.awt.print.Book;
import java.util.List;

import com.bookbuddy.dto.BookDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bookbuddy.service.SavedBooksService;

@RestController
@RequestMapping("/saved-books")
public class SavedBooksController {

    private final SavedBooksService savedBooksService;

    @Autowired
    public SavedBooksController(SavedBooksService savedBooksService) {
        this.savedBooksService = savedBooksService;
    }

    // Get saved books for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List <BookDTO>> getSavedBooksByUserId(@PathVariable Long userId) {
        List<BookDTO> savedBooks = savedBooksService.getSavedBooksByUserId(userId);

        if (savedBooks.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(savedBooks);
    }
}