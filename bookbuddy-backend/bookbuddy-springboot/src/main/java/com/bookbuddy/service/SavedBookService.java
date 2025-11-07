package com.bookbuddy.service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.dto.SavedBookRequest;
import com.bookbuddy.dto.SavedBookResponse;
import com.bookbuddy.exception.DuplicateResourceException;
import com.bookbuddy.exception.ResourceNotFoundException;
import com.bookbuddy.model.SavedBook;
import com.bookbuddy.model.User;
import com.bookbuddy.repository.SavedBookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
    public List<BookDTO> getSavedBooksByUserId(Long userId) {
        List<SavedBook> savedBooks = savedBookRepository.findByUser_UserId(userId);
        List<BookDTO> savedBooksDTOs = new ArrayList<>();

        if (savedBooks.isEmpty()) {
            return savedBooksDTOs;
        }

        //If one book has an error there will be an error fetching all books (JUST A NOTE FOR THE FUTURE)
        for (SavedBook savedBook : savedBooks) {
            String googleBooksId = savedBook.getGoogleBooksId();
            BookDTO currentBookDTO = googleBookAPI.getGoogleBookById(googleBooksId);
            savedBooksDTOs.add(currentBookDTO);
        }
        return savedBooksDTOs;
    }

    //Delete saved book by user id
    public void deleteSavedBooksByUserId(Long userId, String googleBooksId) {
        User user = userService.getUserById(userId);
        Long id = savedBookRepository.findSavedBookIdByUserAndGoogleBooksId(user, googleBooksId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No saved book found for user " + user.getUserId() +
                                " with Google Books ID: " + googleBooksId
                ));

        savedBookRepository.deleteById(id);
    }

    public Integer getTotalNumberOfSavedBooks(Long userId) {
        List <SavedBook> savedBooks = savedBookRepository.findByUser_UserId(userId);
        return savedBooks.size();
    }
}
