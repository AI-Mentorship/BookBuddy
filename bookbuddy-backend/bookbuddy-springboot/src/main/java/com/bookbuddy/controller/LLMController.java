package com.bookbuddy.controller;

import com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO;
import com.bookbuddy.dto.LLMDTO.LLMRequest;
import com.bookbuddy.dto.LLMDTO.LLMResponse;
import com.bookbuddy.service.LLMService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/llm")
@CrossOrigin(origins = "http://localhost:5173")
public class LLMController {

    private LLMService llmService;

    public LLMController(LLMService llmService) {
        this.llmService = llmService;
    }

    @GetMapping("/getRecommendations/{userId}")
    public ResponseEntity<List<BookDTO>> getBookRecommendations(@PathVariable Long userId) {
        LLMRequest llmRequest = llmService.processLLMRequest(userId);
        LLMResponse recommendedBookIds = llmService.fetchRecommendationIdsFromML(llmRequest);
        return ResponseEntity.ok( llmService.getRecommendedBooks(recommendedBookIds));
    }

}
