package com.bookbuddy.dto.ReadBookDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadBookRequest {
    private Long userId;
    private String googleBooksId;
    private String privateReview;
    private double privateRating;
}
