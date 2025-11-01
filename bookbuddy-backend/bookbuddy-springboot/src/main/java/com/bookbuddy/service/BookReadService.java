//package com.bookbuddy.service;
//
//import com.bookbuddy.controller.ReadBookRequest;
//import com.bookbuddy.controller.ReadBookResponse;
//import com.bookbuddy.dto.SavedBookResponse;
//import com.bookbuddy.model.BookRead;
//import com.bookbuddy.model.User;
//import com.bookbuddy.repository.BookReadRepository;
//import org.springframework.stereotype.Service;
//
//import java.awt.print.Book;
//
//@Service
//public class BookReadService {
//
//    private final BookReadRepository bookReadRepository;
//    private final UserService userService;
//
//    public BookReadService(BookReadRepository bookReadRepository, UserService userService) {
//        this.bookReadRepository = bookReadRepository;
//        this.userService = userService;
//    }
//
//    public ReadBookResponse saveReadBook(ReadBookRequest bookRequest) {
//        Long userId = bookRequest.getUserId();
//        User user = userService.getUserById(userId);
//        String googleBooksId = bookRequest.getGoogleBooksId();
//
//       BookRead savedReadBookRead =  bookReadRepository.save(
//                BookRead.builder().
//                        user(user).
//                        googleBooksId(googleBooksId).
//                        private_review(bookRequest.getPrivate_review()).
//                        private_rating(bookRequest.getPrivate_rating()).
//                        build()
//        );
//
//       boolean doesReadBookExist;
//
//       return ReadBookResponse.builder().
//               userId(savedReadBookRead.getUser().getUserId()).
//               googleBooksId(savedReadBookRead.getGoogleBooksId()).
//               private_rating(savedReadBookRead.getPrivate_rating()).
//               private_review(savedReadBookRead.getPrivate_review()).
//               build();
//
//
//    }
//
//    public void deleteReadBook(Long userId, String googleBooksId) {
//        User user = userService.getUserById(userId);
//
//       // bookReadRepository.delete(savedReadBook);
//    }
//}
