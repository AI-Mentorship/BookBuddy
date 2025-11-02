package com.bookbuddy.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BookDTO {
    private String googleBooksId;
    private String title;
    private List<String> authors;
    private String publisher;
    private String publishedDate;
    private String description;
    private Integer pageCount;
    private List <String> categories;
    private Double averageRating;
    private String maturityRating;
    private String thumbnail;
    private String language;
    private String previewLink;
  
}
