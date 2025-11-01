package com.bookbuddy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadBookResponse {
    private Long userId;
    private String googleBooksId;
    private String private_review;
    private double private_rating;
}