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
public class PagedBookResponseDTO {
    private int page;
    private int pageSize;
    private int totalItems;
    private List<BookDTO> books;
}

