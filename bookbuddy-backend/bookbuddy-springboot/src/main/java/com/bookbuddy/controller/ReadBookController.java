package com.bookbuddy.controller;


import com.bookbuddy.dto.GetReadBookResponse;
import com.bookbuddy.dto.ReadBookRequest;
import com.bookbuddy.dto.ReadBookResponse;
import com.bookbuddy.service.ReadBookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("read-books")
public class ReadBookController {

    private final ReadBookService readBookService;

    public ReadBookController(ReadBookService bookReadService) {
        this.readBookService = bookReadService;
    }

    @PostMapping("/save")
    public ResponseEntity<ReadBookResponse> saveReadBook(@RequestBody ReadBookRequest bookRequest) {
        ReadBookResponse readBookResponse = readBookService.saveReadBook(bookRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(readBookResponse);
    }

    @DeleteMapping("/delete/{userId}/{googleBooksId}")
    public ResponseEntity<Void> deleteReadBook(@PathVariable Long userId, @PathVariable String googleBooksId) {
        readBookService.deleteReadBook(userId, googleBooksId);
       return ResponseEntity.ok().build();
    }

    @GetMapping("/read-books/{userId}")
    public ResponseEntity<List<GetReadBookResponse>> readBooksByUserId(@PathVariable Long userId) {
        List <GetReadBookResponse> readBooks = readBookService.getReadBooksByUserId(userId);

        if(readBooks.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(readBooks);
    }

    @PutMapping("/update-review")
    public ResponseEntity<ReadBookResponse> updateReview(@RequestBody ReadBookRequest readBookRequest) {
        ReadBookResponse response = readBookService.updateReview(readBookRequest);
        return ResponseEntity.ok(response);
    }
}
