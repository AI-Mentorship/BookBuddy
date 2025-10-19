package com.bookbuddy.service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.model.SavedBooks;
import com.bookbuddy.repository.SavedBooksRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

@Service
public class SavedBooksService {

    private final SavedBooksRepository savedBooksRepository;
    private final GoogleBookAPI googleBookAPI;

    @Autowired
    public SavedBooksService(SavedBooksRepository savedBooksRepository, GoogleBookAPI googleBookAPI) {
        this.savedBooksRepository = savedBooksRepository;
        this.googleBookAPI = googleBookAPI;
    }

    public List<BookDTO> getSavedBooksByUserId(Long userId) {
        List <SavedBooks> savedBooks = savedBooksRepository.findByUser_UserId(userId);
        List <BookDTO> savedBooksDTOs = new ArrayList<>();

        if(savedBooks.isEmpty()){
            return savedBooksDTOs;
        }

        //If one book has an error there will be an error fetching all books (JUST A NOTE FOR THE FUTURE)
        for(SavedBooks savedBook: savedBooks){
            String googleBooksId = savedBook.getGoogleBooksId();
            BookDTO currentBookDTO = googleBookAPI.getGoogleBookById(googleBooksId);
            savedBooksDTOs.add(currentBookDTO);
        }
        return savedBooksDTOs;
    }
}
