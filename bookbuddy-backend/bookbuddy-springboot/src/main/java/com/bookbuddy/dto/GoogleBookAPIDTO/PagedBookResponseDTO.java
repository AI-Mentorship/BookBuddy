package com.bookbuddy.dto.GoogleBookAPIDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagedBookResponseDTO {
    private int page;
    private int pageSize;
    private int totalItems;
    private boolean hasNextPage;
    private String searchId;
    private List<BookDTO> books;
}

