package com.bookbuddy.dto.LLMDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResponse {
    // Map of bookId -> isValid
    // Example: {"id1": true, "id2": true, "id3": false}
    private Map<String, Boolean> validationResults;
}
