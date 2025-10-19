package com.bookbuddy.exception;

/**
 * Thrown when a user tries to register with an email that already exists.
 * By extending RuntimeException, your class becomes an exception that can be thrown when something goes wrong.
 */
public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
