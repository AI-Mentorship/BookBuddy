package com.bookbuddy.service;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.commons.text.similarity.LevenshteinDistance;


import com.bookbuddy.dto.BookDTO;

public class BookSearchRanker {

    private static final int MAX_LEVENSHTEIN_DISTANCE = 2;
    private static final LevenshteinDistance LD = new LevenshteinDistance();

    // Weight presets per search type
    private static final Map<String, Weights> WEIGHTS_BY_TYPE = Map.of(
            "title", new Weights(3, 1, 2),
            "author", new Weights(0, 5, 1),
            "isbn", new Weights(2, 1, 0),
            "general", new Weights(2, 2, 1)
    );

    public static List<BookDTO> rankBooks(List<BookDTO> books, String query, String type) {
        if (books == null || books.isEmpty() || query == null || query.isBlank()) return books;

        String normalizedQuery = normalize(query);
        List<String> queryTokens = Arrays.asList(normalizedQuery.split("\\s+"));

        // Select weights
        Weights w = WEIGHTS_BY_TYPE.getOrDefault(type.toLowerCase(), WEIGHTS_BY_TYPE.get("general"));

        return books.stream()
                .map(book -> {
                    int score = 0;
                    String title = normalize(book.getTitle());
                    List<String> authors = book.getAuthors() == null
                            ? List.of()
                            : book.getAuthors().stream().map(BookSearchRanker::normalize).toList();
                    String desc = normalize(book.getDescription());

                    // Title scoring
                    if (!title.isEmpty()) {
                        if (title.equals(normalizedQuery)) score += 6 * w.titleWeight; // exact title match
                        else for (String token : queryTokens)
                            if (title.contains(token)) score += 3 * w.titleWeight;

                        // fuzzy match
                        for (String token : queryTokens) {
                            if (LD.apply(title, token) <= MAX_LEVENSHTEIN_DISTANCE)
                                score += 2 * w.titleWeight;
                        }
                    }


                    // Author scoring
                    for (String author : authors) {
                        if (author.equals(normalizedQuery)) score += 8 * w.authorWeight; // strong exact
                        else for (String token : queryTokens)
                            if (author.contains(token)) score += 2 * w.authorWeight;

                        if (LD.apply(author, normalizedQuery) <= MAX_LEVENSHTEIN_DISTANCE)
                            score += 3 * w.authorWeight;
                    }


                    // Description scoring
                    if (!desc.isEmpty()) {
                        for (String token : queryTokens)
                            if (desc.contains(token)) score += 1 * w.descriptionWeight;
                    }


                    // Popularity / Rating Boost
                    if (book.getAverageRating() != null) {
                        double rating = Math.min(6.0, Math.max(0, book.getAverageRating()));
                        score += Math.round(rating / 5.0 * 3);
                    }

                    // Penalize common keywords of Book collection titles
                    if (type.equalsIgnoreCase("title")) {
                        if (title.matches(".*\\b(complete|collection|box set|companion|omnibus)\\b.*"))
                            score -= 5;
                        if (title.split("\\s+").length > 8) score -= 2;
                    }

                    //description words for collections
                    final List<String> penaltyKeywords = List.of(
                            "complete collection", "complete series", "box set", "boxed set",
                            "omnibus", "companion", "anthology", "includes all", "set of",
                            "books 1", "books one", "the entire series", "collection of"
                    );

                    // Normalize both fields for consistent comparison
                    String lowerTitle = title.toLowerCase();
                    String lowerDesc = desc.toLowerCase();

                    // Penalize descriptions with keywords
                    for (String keyword : penaltyKeywords) {
                        if (lowerTitle.contains(keyword) || lowerDesc.contains(keyword)) {
                            score -= 3; // Adjust penalty strength here
                            break;      // Apply penalty once per book
                        }
                    }

                    book.setSearchScore(score);
                    return book;
                })
                .sorted(Comparator.comparingInt(BookDTO::getSearchScore).reversed())
                .collect(Collectors.toList());
    }

    // Helpers
    private static String normalize(String s) {
        if (s == null) return "";
        String n = Normalizer.normalize(s, Normalizer.Form.NFKD);
        n = n.replaceAll("\\p{M}", ""); // remove diacritics
        n = n.toLowerCase().trim();
        n = n.replaceAll("[^\\p{L}\\p{N}\\s\\.]", ""); // keep letters/numbers/spaces/dots
        n = n.replaceAll("\\s+", " ");
        return n;
    }

    private record Weights(int titleWeight, int authorWeight, int descriptionWeight) {}
}
