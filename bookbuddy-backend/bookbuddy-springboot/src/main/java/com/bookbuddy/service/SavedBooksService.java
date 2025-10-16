package com.bookbuddy.service;

import com.bookbuddy.model.SavedBooks;
import com.bookbuddy.repository.SavedBooksRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SavedBooksService {

    private final SavedBooksRepository savedBooksRepository;

    @Autowired
    public SavedBooksService(SavedBooksRepository savedBooksRepository) {
        this.savedBooksRepository = savedBooksRepository;
    }

    public List<SavedBooks> getAllSavedBooks() {
        return savedBooksRepository.findAll();
    }

    public List<SavedBooks> getSavedBooksByUserId(Long userId) {
        return savedBooksRepository.findByUser_UserId(userId);
    }
}
