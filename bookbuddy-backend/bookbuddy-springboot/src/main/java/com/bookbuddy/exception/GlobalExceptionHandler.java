package com.bookbuddy.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // This annotation tells Spring that this method will handle exceptions of type EmailAlreadyExistsException
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExistsException(EmailAlreadyExistsException ex,  HttpServletRequest request) {
        // Return an HTTP response with status 409 CONFLICT
        // The body of the response will contain the exception message
        // ex.getMessage() retrieves the message you passed when throwing the exception

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.CONFLICT.value())
                .error(HttpStatus.CONFLICT.getReasonPhrase())
                .message(ex.getMessage())                // use the exception message here
                .timestamp(System.currentTimeMillis())
                .path(request.getRequestURI())           // use the URL path here
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    // This annotation tells Spring that this method will handle exceptions of type GoogleBookApiException
    @ExceptionHandler(GoogleBookAPIException.class)
    public ResponseEntity<ErrorResponse> handleGoogleBookAPIException(GoogleBookAPIException ex,  HttpServletRequest request) {
        // Return an HTTP response with status 502 BAD_GATEWAY
        // 502 is commonly used when your server fails to get a valid response from an external API (like Google Books)
        // The body of the response contains the exception message for debugging or frontend display

        ErrorResponse errorResponse = ErrorResponse.builder().
                status(HttpStatus.BAD_GATEWAY.value()).
                error(HttpStatus.BAD_GATEWAY.getReasonPhrase()).
                message(ex.getMessage()).
                timestamp(System.currentTimeMillis())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(errorResponse);
    }

    // This annotation tells Spring that this method will handle exceptions of type ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex,  HttpServletRequest request) {
        // Return an HTTP response with status 404 NOT_FOUND
        // This status means the requested resource (such as a user, book, or saved item) could not be found
        // ex.getMessage() contains the descriptive message set in the ResourceNotFoundException constructor

        ErrorResponse errorResponse = ErrorResponse.builder().
                status(HttpStatus.NOT_FOUND.value()).
                error(HttpStatus.BAD_GATEWAY.getReasonPhrase()).
                message(ex.getMessage())
                .timestamp(System.currentTimeMillis()).
                path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    //Handles all other spring default errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())          // 500
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase()) // "Internal Server Error"
                .message("An unexpected error occurred: " + ex.getMessage()) // generic message + optional exception message
                .timestamp(System.currentTimeMillis())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // Handles cases where user credentials are invalid (e.g., wrong password or email)
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentialsException(InvalidCredentialsException ex, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())                   // 401 status code for unauthorized access
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())           // "Unauthorized"
                .message(ex.getMessage())                                   // custom message from the thrown exception
                .timestamp(System.currentTimeMillis())                      // capture time of error
                .path(request.getRequestURI())                              // record which endpoint caused the error
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

}
