package com.bookbuddy.controller;


import com.bookbuddy.dto.ReadBookRequest;
import com.bookbuddy.dto.ReadBookResponse;
import com.bookbuddy.service.BookReadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("read-books")
public class ReadBookController {

    private final BookReadService bookReadService;

    public ReadBookController(BookReadService bookReadService) {
        this.bookReadService = bookReadService;
    }

    @PostMapping("/save")
    public ResponseEntity<ReadBookResponse> saveReadBook(@RequestBody ReadBookRequest bookRequest) {
        ReadBookResponse readBookResponse = bookReadService.saveReadBook(bookRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(readBookResponse);
    }

//    @DeleteMapping("/delete/{userId}/{googleBooksId}")
//    public ResponseEntity<Void> deleteReadBook(@PathVariable Long userId, @PathVariable String googleBooksId) {
//        bookReadService.deleteReadBook(userId, googleBooksId);
//       return ResponseEntity.ok().build();
//    }
}
