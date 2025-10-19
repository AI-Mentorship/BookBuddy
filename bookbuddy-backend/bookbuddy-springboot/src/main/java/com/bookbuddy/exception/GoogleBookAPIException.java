package com.bookbuddy.exception;

/**
 * Custom exception class used to represent errors that occur
 * when communicating with the Google Books API.
 *
 * This extends RuntimeException so it’s unchecked, meaning
 * you don’t have to declare it in method signatures.
 */
public class GoogleBookAPIException extends RuntimeException {
    public GoogleBookAPIException(String message) {
        super(message);
    }
}
