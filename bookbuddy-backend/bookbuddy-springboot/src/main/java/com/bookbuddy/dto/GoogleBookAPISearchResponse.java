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
public class GoogleBookAPISearchResponse {
    private int totalItems; // <-- add this
    private List<Item> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Item {
        private String id;
        private VolumeInfo volumeInfo;
    }

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
        private List<String> categories;
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
