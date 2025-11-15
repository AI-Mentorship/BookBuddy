package com.bookbuddy.service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.bookbuddy.client.GoogleBookAPI;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPISearchResponse;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPISearchResponse.Item;
import com.bookbuddy.dto.GoogleBookAPIDTO.GoogleBookAPISearchResponse.VolumeInfo;
import com.bookbuddy.dto.GoogleBookAPIDTO.PagedBookResponseDTO;
import com.bookbuddy.dto.GoogleBookAPIDTO.BookDTO;

@Service
public class BookSearchService {

    private final GoogleBookAPI googleBookAPI;
    private final LLMService llmService;

    // session cache (searchId -> SearchSession). thread-safe.
    private final Map<String, SearchSession> sessionCache = new ConcurrentHashMap<>();

    // Google returns up to 40 per request
    private static final int GOOGLE_PAGE_CHUNK = 40;

    public BookSearchService(GoogleBookAPI googleBookAPI, LLMService llmService) {
        this.googleBookAPI = googleBookAPI;
        this.llmService = llmService;
    }

    /**
     * New signature - includes userId and searchId (optionally provided).
     *
     * If searchId == null and page == 1 -> creates a new search session and returns its searchId.
     * If searchId provided, reuses that session (must match userId).
     */
    public PagedBookResponseDTO searchBooksPaged(Long userId, String query, String type, int page, int pageSize, String searchId) {
        if (query == null || query.isBlank()) return emptyPagedResponse(page, pageSize, searchId);

        // enforce sane page/pageSize bounds (you may change)
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        // Build the formatted query for Google (intitle:, inauthor:, isbn:, or general)
        String formattedQuery = buildQuery(query.trim(), type);

        // Create or lookup session
        SearchSession session;
        if (searchId == null || searchId.isBlank()) {
            // Only create new session when requesting page 1 (safety)
            if (page != 1) {
                throw new IllegalArgumentException("searchId required for page > 1");
            }
            searchId = UUID.randomUUID().toString();
            session = new SearchSession(userId, formattedQuery, query.trim(), type, searchId, 0);
            sessionCache.put(searchId, session);
        } else {
            session = sessionCache.get(searchId);
            if (session == null) {
                // Not found — if page==1 we can create; otherwise error
                if (page == 1) {
                    session = new SearchSession(userId, formattedQuery, query.trim(), type, searchId, 0);
                    sessionCache.put(searchId, session);
                } else {
                    throw new IllegalArgumentException("Unknown or expired searchId: " + searchId);
                }
            } else {
                // verify userId matches session owner (security)
                if (!Objects.equals(session.userId, userId)) {
                    // optionally you can allow null userId or skip user checks
                    throw new IllegalArgumentException("searchId does not belong to user");
                }
                // If the incoming query/type differs from session, we should reset (or reject).
                if (!Objects.equals(session.normalizedQuery, formattedQuery) || !Objects.equals(session.type, type)) {
                    // defensive: create a fresh session for this new query (don't clobber old)
                    searchId = UUID.randomUUID().toString();
                    session = new SearchSession(userId, formattedQuery, query.trim(), type, searchId, 0);
                    sessionCache.put(searchId, session);
                }
            }
        }
        session.touch();

        // Now collect up to pageSize validated books for THIS PAGE.
        List<BookDTO> pageBooks = new ArrayList<>(pageSize);

        // We must: consume validatedQueue first (these are guaranteed valid)
        while (pageBooks.size() < pageSize && !session.validatedQueue.isEmpty()) {
            String gid = session.validatedQueue.poll();
            if (gid == null) break;
            BookDTO dto = safeGetBookById(gid);
            if (dto != null) pageBooks.add(dto);
        }

        // If not enough validated books to fill the page, fetch more chunks from Google and validate them
        while (pageBooks.size() < pageSize) {
            // If we've already scanned all Google results and there are no validated ids left -> stop.
            if (session.totalItems >= 0 && session.nextGoogleStartIndex >= session.totalItems && session.validatedQueue.isEmpty()) {
                break;
            }

            // Fetch next chunk from Google (40)
            GoogleBookAPISearchResponse searchResp = googleBookAPI.rawSearch(session.normalizedQuery, session.nextGoogleStartIndex, GOOGLE_PAGE_CHUNK);
            if (searchResp == null || (searchResp.getItems() == null || searchResp.getItems().isEmpty())) {
                // Nothing returned - mark totalItems if available and break
                if (searchResp != null) {
                    session.totalItems = searchResp.getTotalItems();
                }
                break;
            }

            // Record totalItems if not set
            if (session.totalItems < 0) {
                session.totalItems = searchResp.getTotalItems();
            }

            // Extract Google IDs, skipping ones we've already looked at
            List<String> idsToValidate = new ArrayList<>();
            for (Item item : searchResp.getItems()) {
                if (item == null || item.getId() == null) continue;
                String gid = item.getId();
                if (session.seenGoogleIds.contains(gid)) continue; // avoid reprocessing same id
                session.seenGoogleIds.add(gid);
                idsToValidate.add(gid);
            }

            // If nothing new to validate from this chunk, advance and continue
            session.nextGoogleStartIndex += searchResp.getItems().size();

            if (idsToValidate.isEmpty()) {
                // no new ids in this chunk - try next chunk (loop will continue)
                // But protect infinite loop if nextGoogleStartIndex doesn't advance (shouldn't happen)
                continue;
            }

            // Validate IDs with LLM/ML service (returns only valid ids)
            List<String> validated = llmService.getValidBookIds(idsToValidate);

            if (validated != null && !validated.isEmpty()) {
                // Add to session validated structures (dedupe via validatedSet)
                for (String vid : validated) {
                    if (!session.validatedSet.contains(vid)) {
                        session.validatedSet.add(vid);
                        session.validatedQueue.add(vid);
                    }
                }

                // Consume from validatedQueue into pageBooks until page filled
                while (pageBooks.size() < pageSize && !session.validatedQueue.isEmpty()) {
                    String gid = session.validatedQueue.poll();
                    if (gid == null) break;
                    BookDTO dto = safeGetBookById(gid);
                    if (dto != null) pageBooks.add(dto);
                }
            }

            // If after validation & consumption we still haven't filled the page, loop will fetch next chunk.
        }

        // At this point pageBooks may be < pageSize if not enough overall results available.

        // Rank the page's books
        List<BookDTO> ranked = BookSearchRanker.rankBooks(pageBooks, query, type);

        // Determine totalItems and hasNextPage
        int totalItems = (session.totalItems >= 0) ? session.totalItems : 0;

        boolean hasMoreValidated = !session.validatedQueue.isEmpty();
        boolean googleHasMore = (session.totalItems < 0) ? true : (session.nextGoogleStartIndex < session.totalItems);
        boolean hasNextPage = (ranked.size() == pageSize) && (hasMoreValidated || googleHasMore);

        // If Google reported fewer total items than needed for next page, no next page
        if (session.totalItems >= 0 && session.nextGoogleStartIndex >= session.totalItems && session.validatedQueue.isEmpty()) {
            hasNextPage = false;
        }

        // Build response (include searchId so frontend can request next page)
        PagedBookResponseDTO resp = PagedBookResponseDTO.builder()
                .page(page)
                .pageSize(pageSize)
                .totalItems(totalItems)
                .hasNextPage(hasNextPage)
                .searchId(session.searchId)
                .books(ranked)
                .build();

        return resp;
    }

    // Helper that wraps googleBookAPI.getGoogleBookById with null checks
    private BookDTO safeGetBookById(String googleId) {
        try {
            BookDTO dto = googleBookAPI.getGoogleBookById(googleId);
            return dto;
        } catch (Exception e) {
            // Log and skip invalid/faulty id
            System.out.println("Failed to fetch Google Book by ID " + googleId + ": " + e.getMessage());
            return null;
        }
    }

    // small empty response helper
    private PagedBookResponseDTO emptyPagedResponse(int page, int pageSize, String searchId) {
        return PagedBookResponseDTO.builder()
                .page(page)
                .pageSize(pageSize)
                .totalItems(0)
                .hasNextPage(false)
                .searchId(searchId)
                .books(Collections.emptyList())
                .build();
    }

    // Understanding search type requested (same as you had)
    private String buildQuery(String query, String type) {
        if (query == null || query.isBlank()) return "";

        query = query.trim();

        return switch (type.toLowerCase()) {
            case "title"  -> "intitle:" + query;
            case "author" -> "inauthor:" + query;
            case "isbn"   -> "isbn:" + query.replaceAll("[^0-9Xx]", "");
            case "general" -> query;
            default -> query;
        };
    }

}
