package com.bookbuddy.service;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Small structure to track a single user's search session.
 */
class SearchSession {
    final Long userId;
    final String normalizedQuery;   // formattedQuery used to call Google (with intitle:/inauthor: prefix)
    final String rawQuery;          // original user-input query
    final String type;
    int totalItems = -1;            // from Google; -1 until known
    int nextGoogleStartIndex = 0;   // where to fetch the next block of 40 from Google
    final Queue<String> validatedQueue = new ConcurrentLinkedQueue<>(); // validated google IDs ready to use
    final Set<String> validatedSet = Collections.synchronizedSet(new HashSet<>()); // all validated IDs for dedupe
    final Set<String> seenGoogleIds = Collections.synchronizedSet(new HashSet<>()); // avoid re-requesting same id
    final String searchId;
    long lastTouched = System.currentTimeMillis();

    SearchSession(Long userId, String normalizedQuery, String rawQuery, String type, String searchId, int startIndex) {
        this.userId = userId;
        this.normalizedQuery = normalizedQuery;
        this.rawQuery = rawQuery;
        this.type = type;
        this.searchId = searchId;
        this.nextGoogleStartIndex = startIndex;
    }

    void touch() { lastTouched = System.currentTimeMillis(); }
}
