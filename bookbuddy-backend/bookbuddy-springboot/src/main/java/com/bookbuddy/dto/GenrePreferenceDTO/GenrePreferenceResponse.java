package com.bookbuddy.dto.GenrePreferenceDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenrePreferenceResponse {
    private String genre;
}
