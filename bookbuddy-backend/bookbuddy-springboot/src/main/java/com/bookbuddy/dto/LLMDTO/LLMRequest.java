package com.bookbuddy.dto.LLMDTO;

import com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO;
import com.bookbuddy.dto.GenrePreferenceDTO.GenrePreferenceResponse;
import com.bookbuddy.dto.ReadBookDTO.GetReadBookResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LLMRequest {
    private List<BookDTO> savedBookData;
    private List<GetReadBookResponse> readBookData;
    private List<GenrePreferenceResponse> genrePreferenceData;

}

/*
here is what sample json data given to the llm:
{
  "savedBookData": [
    {
      "googleBooksId": "abc123",
      "title": "The Hobbit",
      "authors": ["J.R.R. Tolkien"],
      "publisher": "George Allen & Unwin",
      "publishedDate": "1937-09-21",
      "description": "A fantasy novel about a hobbit's adventure.",
      "pageCount": 310,
      "categories": ["Fantasy"],
      "averageRating": 4.7,
      "maturityRating": "PG",
      "thumbnail": "http://example.com/hobbit.jpg",
      "language": "en",
      "previewLink": "http://books.google.com/hobbit"
    }
  ],
  "readBookData": [
    {
      "googleBooksId": "ghi789",
      "title": "Dune",
      "authors": ["Frank Herbert"],
      "publisher": "Chilton Books",
      "publishedDate": "1965-08-01",
      "description": "Science fiction novel set on the desert planet Arrakis.",
      "pageCount": 412,
      "categories": ["Science Fiction"],
      "averageRating": 4.8,
      "maturityRating": "PG",
      "thumbnail": "http://example.com/dune.jpg",
      "language": "en",
      "previewLink": "http://books.google.com/dune",
      "privateReview": "Amazing world-building.",
      "privateRating": 5.0
    }
  ],
  "genrePreferenceData": [
    { "genre": "Science Fiction" },
    { "genre": "Classics" },
    { "genre": "Fantasy" },
    { "genre": "Mystery" }
  ]
}
 */