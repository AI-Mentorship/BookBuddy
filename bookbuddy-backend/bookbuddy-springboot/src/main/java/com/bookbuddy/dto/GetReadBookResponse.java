package com.bookbuddy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class GetReadBookResponse extends BookDTO {
    private String privateReview;
    private Double privateRating;
}
