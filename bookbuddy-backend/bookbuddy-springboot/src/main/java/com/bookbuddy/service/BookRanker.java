package com.bookbuddy.service;


import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.bookbuddy.dto.BookDTO;

public class BookRanker {

    /**
     * Score each book based on title, author, description, and optional metadata.
     * @param books List of BookDTO from Google Books
     * @param query The user search string
     * @param type "title", "author", "isbn", or "general"
     * @return Sorted list of BookDTO with most relevant first
     */
    public static List<BookDTO> rankBooks(List<BookDTO> books, String query, String type) {
        if (books == null || books.isEmpty() || query == null || query.isBlank()) return books;

        String normalizedQuery = query.toLowerCase().trim();
        List<String> queryTokens = Arrays.asList(normalizedQuery.split("\\s+"));

        return books.stream()
                .map(book -> {
                    int score = 0;

                    // ----------------------
                    // Title scoring
                    // ----------------------
                    if (book.getTitle() != null) {
                        String title = book.getTitle().toLowerCase();
                        if (title.equals(normalizedQuery)) score += 5;          // exact title match
                        else {
                            for (String token : queryTokens) {
                                if (title.contains(token)) score += 2;          // partial token match
                            }
                        }
                    }

                    // ----------------------
                    // Author scoring
                    // ----------------------
                    if (book.getAuthors() != null && !book.getAuthors().isEmpty()) {
                        List<String> authors = book.getAuthors().stream()
                                .map(String::toLowerCase)
                                .collect(Collectors.toList());

                        for (String author : authors) {
                            if (author.equals(normalizedQuery)) score += 4;  // exact author
                            else {
                                for (String token : queryTokens) {
                                    if (author.contains(token)) score += 1;    // partial author match
                                }
                            }
                        }
                    }

                    // ----------------------
                    // Description scoring
                    // ----------------------
                    if (book.getDescription() != null) {
                        String desc = book.getDescription().toLowerCase();
                        for (String token : queryTokens) {
                            if (desc.contains(token)) score += 1;
                        }
                    }


                    // Google Book Rating boost
                    if (book.getAverageRating() != null) {
                        double rating = book.getAverageRating();
                        double ratingWeight = rating / 5.0;   // normalize 0–1
                        score += (int) Math.round(ratingWeight * 3);  // gentle influence (0–3 pts)
                    }

                    // Store score in a transient field or map
                    book.setSearchScore(score);
                    return book;
                })
                .sorted(Comparator.comparingInt(BookDTO::getSearchScore).reversed()) // sort by descending score
                .collect(Collectors.toList());
    }
}
