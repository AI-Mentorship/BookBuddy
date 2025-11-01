package com.bookbuddy.controller;

import java.util.List;

import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.dto.SavedBookRequest;
import com.bookbuddy.dto.SavedBookResponse;
import com.bookbuddy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bookbuddy.service.SavedBooksService;

@RestController
@RequestMapping("/saved-books")
@CrossOrigin(origins = "http://localhost:5173") // your frontend URL
public class SavedBookController {

    private final SavedBooksService savedBooksService;

    @Autowired
    public SavedBookController(SavedBooksService savedBooksService, UserService userService) {
        this.savedBooksService = savedBooksService;
    }

    //Save Books
    @PostMapping("/save")
    public ResponseEntity<SavedBookResponse> saveBook(@RequestBody SavedBookRequest bookRequest) {
        SavedBookResponse responseDTO = savedBooksService.saveBook(bookRequest);
        // Return with CREATED status
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }


    // Get saved books for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookDTO>> getSavedBooksByUserId(@PathVariable Long userId) {
        List<BookDTO> savedBooks = savedBooksService.getSavedBooksByUserId(userId);

        if (savedBooks.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(savedBooks);
    }

    @DeleteMapping("/delete/user/{userId}/book/{googleBooksId}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long userId, @PathVariable String googleBooksId) {
        savedBooksService.deleteSavedBooksByUserId(userId, googleBooksId);

        // Return 204 NO_CONTENT to indicate successful deletion
        return ResponseEntity.ok().build();
    }

}