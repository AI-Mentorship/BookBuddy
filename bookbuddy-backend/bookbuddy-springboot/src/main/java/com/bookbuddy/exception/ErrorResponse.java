package com.bookbuddy.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private int status;          // HTTP status code
    private String error;        // HTTP status text (e.g., "NOT_FOUND")
    private String message;      // Exception message
    private long timestamp;      // Optional: when the error occurred
    private String path;         // Optional: URL path of the request
}
