package com.bookbuddy.service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.BookDTO;
import com.bookbuddy.dto.GetReadBookResponse;
import com.bookbuddy.dto.ReadBookRequest;
import com.bookbuddy.dto.ReadBookResponse;
import com.bookbuddy.exception.DuplicateResourceException;
import com.bookbuddy.exception.ResourceNotFoundException;
import com.bookbuddy.model.ReadBook;
import com.bookbuddy.model.User;
import com.bookbuddy.repository.ReadBookRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReadBookService {

    private final ReadBookRepository readBookRepository;
    private final UserService userService;
    private final GoogleBookAPI googleBookAPI;

    public ReadBookService(ReadBookRepository readBookRepository, UserService userService, GoogleBookAPI googleBookAPI) {
        this.readBookRepository = readBookRepository;
        this.userService = userService;
        this.googleBookAPI = googleBookAPI;
    }

    public ReadBookResponse saveReadBook(ReadBookRequest bookRequest) {
        Long userId = bookRequest.getUserId();
        User user = userService.getUserById(userId);
        String googleBooksId = bookRequest.getGoogleBooksId();

        boolean doesReadBookExist = readBookRepository.existsByUserAndGoogleBooksId(user, googleBooksId);

        if (doesReadBookExist) {
            throw new DuplicateResourceException("This book is already read");
        }

        ReadBook savedReadBookRead = readBookRepository.save(
                ReadBook.builder().
                        user(user).
                        googleBooksId(googleBooksId).
                        privateReview(bookRequest.getPrivateReview()).
                        privateRating(bookRequest.getPrivateRating()).
                        build()
        );

        return ReadBookResponse.builder().
                userId(savedReadBookRead.getUser().getUserId()).
                googleBooksId(savedReadBookRead.getGoogleBooksId()).
                privateReview(savedReadBookRead.getPrivateReview()).
                privateRating(savedReadBookRead.getPrivateRating()).
                build();

    }

    public void deleteReadBook(Long userId, String googleBooksId) {
        User user = userService.getUserById(userId);
        Long id = readBookRepository.findReadBookIdByUserAndGoogleBooksId(user, googleBooksId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No read book found for user " + user.getUserId() +
                                " with Google Books ID: " + googleBooksId
                ));
        readBookRepository.deleteById(id);
    }

    public List<GetReadBookResponse> getReadBooksByUserId(Long userId) {
        List<ReadBook> readBooks = readBookRepository.findByUser_UserId(userId);
        List<GetReadBookResponse> responses = new ArrayList<>();

        if (readBooks.isEmpty()) {
            return responses;
        }

        for (ReadBook readBook : readBooks) {
            String googleBooksId = readBook.getGoogleBooksId();

            try {
                BookDTO readBookDTO = googleBookAPI.getGoogleBookById(googleBooksId);
                responses.add(
                        GetReadBookResponse.builder()
                                .googleBooksId(readBookDTO.getGoogleBooksId())
                                .title(readBookDTO.getTitle())
                                .authors(readBookDTO.getAuthors())
                                .publisher(readBookDTO.getPublisher())
                                .publishedDate(readBookDTO.getPublishedDate())
                                .description(readBookDTO.getDescription())
                                .pageCount(readBookDTO.getPageCount())
                                .categories(readBookDTO.getCategories())
                                .averageRating(readBookDTO.getAverageRating())
                                .maturityRating(readBookDTO.getMaturityRating())
                                .thumbnail(readBookDTO.getThumbnail())
                                .language(readBookDTO.getLanguage())
                                .previewLink(readBookDTO.getPreviewLink())
                                .privateReview(readBook.getPrivateReview())
                                .privateRating(readBook.getPrivateRating())
                                .build());
            } catch (Exception e) {
                // Google Books API failed - create a fallback response
                System.err.println("Failed to fetch book details for " + googleBooksId + ": " + e.getMessage());

                // Still add the book with minimal info so user can see their rating/review
                responses.add(
                        GetReadBookResponse.builder()
                                .googleBooksId(googleBooksId)
                                .title("Book details unavailable")
                                .authors(List.of("Unknown"))
                                .description("Unable to fetch book details from Google Books API")
                                .thumbnail(null)
                                .pageCount(0)
                                .categories(List.of())
                                .privateReview(readBook.getPrivateReview())
                                .privateRating(readBook.getPrivateRating())
                                .build());
            }
        }

        return responses;
    }

    public GetReadBookResponse getReadBookByUserAndGoogleBooksId(Long userId, String googleBooksId) {
        User user = userService.getUserById(userId);
        ReadBook readBook = readBookRepository.findByUserAndGoogleBooksId(user, googleBooksId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No read book found for user " + userId + " with Google Books ID: " + googleBooksId
                ));

        BookDTO dto = googleBookAPI.getGoogleBookById(googleBooksId);
        return GetReadBookResponse.builder()
                .googleBooksId(dto.getGoogleBooksId())
                .title(dto.getTitle())
                .authors(dto.getAuthors())
                .publisher(dto.getPublisher())
                .publishedDate(dto.getPublishedDate())
                .description(dto.getDescription())
                .pageCount(dto.getPageCount())
                .categories(dto.getCategories())
                .averageRating(dto.getAverageRating())
                .maturityRating(dto.getMaturityRating())
                .thumbnail(dto.getThumbnail())
                .language(dto.getLanguage())
                .previewLink(dto.getPreviewLink())
                .privateReview(readBook.getPrivateReview())
                .privateRating(readBook.getPrivateRating())
                .build();
    }

    public ReadBookResponse updateReview(ReadBookRequest readBookRequest) {
        User user = userService.getUserById(readBookRequest.getUserId());
        String googleBooksId = readBookRequest.getGoogleBooksId();
        Long id = readBookRepository.findReadBookIdByUserAndGoogleBooksId(user, googleBooksId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No read book found for user " + user.getUserId() +
                                " with Google Books ID: " + googleBooksId
                ));
        ReadBook readBook = readBookRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("No read book found for user " + id));
        readBook.setPrivateReview(readBookRequest.getPrivateReview());
        readBook.setPrivateRating(readBookRequest.getPrivateRating());

        readBookRepository.save(readBook);

        return ReadBookResponse.builder().
                userId(readBook.getUser().getUserId()).
                googleBooksId(readBook.getGoogleBooksId()).
                privateReview(readBook.getPrivateReview()).
                privateRating(readBook.getPrivateRating()).
                build();
    }

    public Integer getTotalNumberOfReadBooks(Long userId) {
        List<ReadBook> readBooks = readBookRepository.findByUser_UserId(userId);
        return readBooks.size();
    }

    public void saveAllReadBooks(List<ReadBookRequest> bookRequests) {
        List<ReadBook> readBooks = new ArrayList<>();
        for (ReadBookRequest readBookRequest : bookRequests) {
            User currentUser = userService.getUserById(readBookRequest.getUserId());

            ReadBook currentReadBook = ReadBook.builder()
                    .user(currentUser)
                    .googleBooksId(readBookRequest.getGoogleBooksId())
                    .privateReview(readBookRequest.getPrivateReview())
                    .privateRating(readBookRequest.getPrivateRating())
                    .build();

            readBooks.add(currentReadBook);
        }
        readBookRepository.saveAll(readBooks);
    }
}
