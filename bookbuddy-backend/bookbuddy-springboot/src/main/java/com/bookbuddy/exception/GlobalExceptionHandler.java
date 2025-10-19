package com.bookbuddy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // This annotation tells Spring that this method will handle exceptions of type EmailAlreadyExistsException
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<String> handleEmailAlreadyExistsException(EmailAlreadyExistsException ex) {
        // Return an HTTP response with status 409 CONFLICT
        // The body of the response will contain the exception message
        // ex.getMessage() retrieves the message you passed when throwing the exception
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    // This annotation tells Spring that this method will handle exceptions of type GoogleBookApiException
    @ExceptionHandler(GoogleBookAPIException.class)
    public ResponseEntity<String> handleGoogleBookApiException(GoogleBookAPIException ex) {
        // Return an HTTP response with status 502 BAD_GATEWAY
        // 502 is commonly used when your server fails to get a valid response from an external API (like Google Books)
        // The body of the response contains the exception message for debugging or frontend display
        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(ex.getMessage());
    }

}
