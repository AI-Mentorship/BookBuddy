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
public class GoogleBookAPIResponse  {
    private String id;
    private VolumeInfo volumeInfo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VolumeInfo {
        private String title;
        private List<String> authors;
        private String publisher;
        private String publishedDate;
        private String description;
        private Integer pageCount;
        private List <String> categories;
        private Double averageRating;
        private String maturityRating;
        private ImageLinks imageLinks;
        private String language;
        private String previewLink;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImageLinks {
        private String thumbnail;
    }

}
