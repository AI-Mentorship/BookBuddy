package com.bookbuddy.controller;

import java.util.List;

import com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO;
import com.bookbuddy.dto.SavedBookDTO.SavedBookRequest;
import com.bookbuddy.dto.SavedBookDTO.SavedBookResponse;
import com.bookbuddy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bookbuddy.service.SavedBookService;

@RestController
@RequestMapping("/saved-books")
@CrossOrigin(origins = "http://localhost:5173") // your frontend URL
public class SavedBookController {

    private final SavedBookService savedBooksService;

    @Autowired
    public SavedBookController(SavedBookService savedBooksService, UserService userService) {
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

    @GetMapping("/total/{userId}")
    public ResponseEntity<Integer> getTotalNumberOfSavedBooks(@PathVariable Long userId) {
        Integer total = savedBooksService.getTotalNumberOfSavedBooks(userId);
        return ResponseEntity.ok(total);
    }

}