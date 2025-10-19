package com.bookbuddy.service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.model.SavedBook;
import com.bookbuddy.repository.SavedBookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SavedBooksService {

    private final SavedBookRepository savedBooksRepository;
    private final GoogleBookAPI googleBookAPI;

    @Autowired
    public SavedBooksService(SavedBookRepository savedBooksRepository, GoogleBookAPI googleBookAPI) {
        this.savedBooksRepository = savedBooksRepository;
        this.googleBookAPI = googleBookAPI;
    }

    //Add books to the database
    public SavedBook saveBook(SavedBook savedBook) {
        return savedBooksRepository.save(savedBook); // returns the saved entity with generated ID
    }


    // Get all saved books by particular user
    public List<BookDTO> getSavedBooksByUserId(Long userId) {
        List <SavedBook> savedBooks = savedBooksRepository.findByUser_UserId(userId);
        List <BookDTO> savedBooksDTOs = new ArrayList<>();

        if(savedBooks.isEmpty()){
            return savedBooksDTOs;
        }

        //If one book has an error there will be an error fetching all books (JUST A NOTE FOR THE FUTURE)
        for(SavedBook savedBook: savedBooks){
            String googleBooksId = savedBook.getGoogleBooksId();
            BookDTO currentBookDTO = googleBookAPI.getGoogleBookById(googleBooksId);
            savedBooksDTOs.add(currentBookDTO);
        }
        return savedBooksDTOs;
    }
}
