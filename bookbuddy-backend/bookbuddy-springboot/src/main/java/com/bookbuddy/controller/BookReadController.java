//package com.bookbuddy.controller;
//
//
//import com.bookbuddy.dto.SavedBookRequest;
//import com.bookbuddy.dto.SavedBookResponse;
//import com.bookbuddy.service.BookReadService;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("read-books")
//public class BookReadController {
//
//    private final BookReadService bookReadService;
//
//    public BookReadController(BookReadService bookReadService) {
//        this.bookReadService = bookReadService;
//    }
//
//    @PostMapping("/save")
//    public ResponseEntity<ReadBookResponse> saveReadBook(@RequestBody ReadBookRequest bookRequest) {
//        ReadBookResponse readBookResponse = bookReadService.saveReadBook(bookRequest);
//        return ResponseEntity.status(HttpStatus.CREATED).body(readBookResponse);
//    }
//
//    @DeleteMapping("/delete/{userId}/{googleBooksId}")
//    public ResponseEntity<Void> deleteReadBook(@PathVariable Long userId, @PathVariable String googleBooksId) {
//        bookReadService.deleteReadBook(userId, googleBooksId);
//       return ResponseEntity.ok().build();
//    }
//}
