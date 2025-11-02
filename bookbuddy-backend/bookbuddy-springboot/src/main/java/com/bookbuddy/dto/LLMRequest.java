package com.bookbuddy.dto;

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

