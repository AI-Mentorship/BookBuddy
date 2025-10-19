package com.bookbuddy.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long userId) {
        // Convert the Long ID to a descriptive message string
        super("User with ID " + userId + " not found");
    }
}

