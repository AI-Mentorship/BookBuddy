package com.bookbuddy.controller;

import java.util.List;

import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.dto.SavedBookRequest;
import com.bookbuddy.dto.SavedBookResponse;
import com.bookbuddy.model.SavedBook;
import com.bookbuddy.model.User;
import com.bookbuddy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bookbuddy.service.SavedBooksService;

@RestController
@RequestMapping("/saved-books")
public class SavedBookController {

    private final SavedBooksService savedBooksService;
    private final UserService userService;

    @Autowired
    public SavedBookController(SavedBooksService savedBooksService, UserService userService) {
        this.savedBooksService = savedBooksService;
        this.userService = userService;
    }

    //Save Books
    @PostMapping("save")
    public ResponseEntity<SavedBookResponse> saveBook(@RequestBody SavedBookRequest savedBookRequest) {
        // Fetch the full User entity
        User user = userService.getUserById(savedBookRequest.getUserId());

        // Build the SavedBook entity
        SavedBook savedBook = SavedBook.builder()
                .user(user)
                .googleBooksId(savedBookRequest.getGoogleBooksId())
                .build();

        // Save it in the repository
        SavedBook savedBookEntity = savedBooksService.saveBook(savedBook);

        //  Map to response DTO
        SavedBookResponse responseDTO = SavedBookResponse.builder()
                .userId(savedBookEntity.getUser().getUserId())
                .googleBooksId(savedBookEntity.getGoogleBooksId())
                .build();

        // Return with CREATED status
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
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