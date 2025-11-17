package com.bookbuddy.service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO;
import com.bookbuddy.dto.SavedBookDTO.SavedBookRequest;
import com.bookbuddy.dto.SavedBookDTO.SavedBookResponse;
import com.bookbuddy.exception.DuplicateResourceException;
import com.bookbuddy.exception.ResourceNotFoundException;
import com.bookbuddy.model.SavedBook;
import com.bookbuddy.model.User;
import com.bookbuddy.repository.SavedBookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class SavedBookService {

    private final SavedBookRepository savedBookRepository;
    private final GoogleBookAPI googleBookAPI;
    private final UserService userService;


    @Autowired
    public SavedBookService(SavedBookRepository savedBookRepository, GoogleBookAPI googleBookAPI, UserService userService) {
        this.savedBookRepository = savedBookRepository;
        this.googleBookAPI = googleBookAPI;
        this.userService = userService;
    }

    //Add books to the database
    @Transactional
    public SavedBookResponse saveBook(SavedBookRequest bookRequest) {
        // Fetch the full User entity
        User user = userService.getUserById(bookRequest.getUserId());

        // Build the SavedBook entity
        SavedBook savedBook = SavedBook.builder()
                .user(user)
                .googleBooksId(bookRequest.getGoogleBooksId())
                .build();

        boolean doesSavedBookExist = savedBookRepository.existsByUserAndGoogleBooksId(user, bookRequest.getGoogleBooksId());

        if(doesSavedBookExist){
            throw new DuplicateResourceException("This book is already saved");
        }

        SavedBook savedBookEntity = savedBookRepository.save(savedBook); // the saved entity with generated ID

        //  Map ato response DTO and return
        return SavedBookResponse.builder()
                .userId(savedBookEntity.getUser().getUserId())
                .googleBooksId(savedBookEntity.getGoogleBooksId())
                .build();
    }


    // Get all saved books by particular user
    @Transactional(readOnly = true)
    public List<BookDTO> getSavedBooksByUserId(Long userId) {
        List<SavedBook> savedBooks = savedBookRepository.findByUser_UserId(userId);
        List<BookDTO> savedBooksDTOs = new ArrayList<>();

        if (savedBooks.isEmpty()) {
            return savedBooksDTOs;
        }

        // Fetch all books in parallel for better performance
        List<CompletableFuture<BookDTO>> futures = savedBooks.stream()
                .map(savedBook -> CompletableFuture.supplyAsync(() -> {
                    try {
                        String googleBooksId = savedBook.getGoogleBooksId();
                        return googleBookAPI.getGoogleBookById(googleBooksId);
                    } catch (Exception e) {
                        // Log error but don't fail entire request - return null and filter out
                        System.err.println("Failed to fetch saved book " + savedBook.getGoogleBooksId() + ": " + e.getMessage());
                        return null;
                    }
                }))
                .collect(Collectors.toList());

        // Wait for all futures to complete and collect results
        savedBooksDTOs = futures.stream()
                .map(CompletableFuture::join)
                .filter(bookDTO -> bookDTO != null) // Filter out failed requests
                .collect(Collectors.toList());

        return savedBooksDTOs;
    }

    //Delete saved book by user id
    @Transactional
    public void deleteSavedBooksByUserId(Long userId, String googleBooksId) {
        User user = userService.getUserById(userId);
        Long id = savedBookRepository.findSavedBookIdByUserAndGoogleBooksId(user, googleBooksId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No saved book found for user " + user.getUserId() +
                                " with Google Books ID: " + googleBooksId
                ));

        savedBookRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Integer getTotalNumberOfSavedBooks(Long userId) {
        List <SavedBook> savedBooks = savedBookRepository.findByUser_UserId(userId);
        return savedBooks.size();
    }
}
