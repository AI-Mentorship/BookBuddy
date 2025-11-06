package com.bookbuddy.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LLMRequest {
    private List<BookDTO> savedBookData;
    private List<GetReadBookResponse> readBookData;
    private List<GenrePreferenceResponse> genrePreferenceData;

}
