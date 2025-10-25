package com.bookbuddy.service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.BookDTO;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookSearchService {

    private final GoogleBookAPI googleBookAPI;

    public BookSearchService(GoogleBookAPI googleBookAPI) {
        this.googleBookAPI = googleBookAPI;
    }

    public List<BookDTO> searchBooks(String query) {
        return googleBookAPI.searchBooks(query);
    }
}
