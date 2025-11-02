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


    // transient means it won't be serialized in JSON or stored in DB)
    private transient int searchScore;
}
