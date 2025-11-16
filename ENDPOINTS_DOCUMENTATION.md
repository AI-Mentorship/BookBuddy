# BookBuddy Spring Boot API Endpoints

## BookSearchController
**Base Path:** `/api/books`

| HTTP Method | URL | Request DTO | Response DTO |
|-------------|-----|-------------|--------------|
| GET | `/api/books/search?userId={userId}&q={query}&type={type}&page={page}&pageSize={pageSize}&searchId={searchId}` | Query Parameters: `userId` (Long), `q` (String), `type` (String, default: "general"), `page` (int, default: 1), `pageSize` (int, default: 20), `searchId` (String, optional) | `PagedBookResponseDTO` |

---

## UserController
**Base Path:** `/users`

| HTTP Method | URL | Request DTO | Response DTO |
|-------------|-----|-------------|--------------|
| POST | `/users/signUp` | `UserRequest` | `UserResponse` |
| POST | `/users/signIn` | `LoginRequest` | `UserResponse` |
| PUT | `/users/update/{userId}` | `UserRequest` | `UserResponse` |

---

## SavedBookController
**Base Path:** `/saved-books`

| HTTP Method | URL | Request DTO | Response DTO |
|-------------|-----|-------------|--------------|
| POST | `/saved-books/save` | `SavedBookRequest` | `SavedBookResponse` |
| GET | `/saved-books/user/{userId}` | Path Parameter: `userId` (Long) | `List<BookDTO>` |
| DELETE | `/saved-books/delete/user/{userId}/book/{googleBooksId}` | Path Parameters: `userId` (Long), `googleBooksId` (String) | `Void` |
| GET | `/saved-books/total/{userId}` | Path Parameter: `userId` (Long) | `Integer` |

---

## ReadBookController
**Base Path:** `/read-books`

| HTTP Method | URL | Request DTO | Response DTO |
|-------------|-----|-------------|--------------|
| POST | `/read-books/save` | `ReadBookRequest` | `ReadBookResponse` |
| POST | `/read-books/saveAll` | `List<ReadBookRequest>` | `Map<String, String>` |
| DELETE | `/read-books/delete/{userId}/{googleBooksId}` | Path Parameters: `userId` (Long), `googleBooksId` (String) | `Void` |
| GET | `/read-books/read-books/{userId}` | Path Parameter: `userId` (Long) | `List<GetReadBookResponse>` |
| PUT | `/read-books/update-review` | `ReadBookRequest` | `ReadBookResponse` |
| GET | `/read-books/total/{userId}` | Path Parameter: `userId` (Long) | `Integer` |

---

## LLMController
**Base Path:** `/llm`

| HTTP Method | URL | Request DTO | Response DTO |
|-------------|-----|-------------|--------------|
| GET | `/llm/getRecommendations/{userId}` | Path Parameter: `userId` (Long) | `List<BookDTO>` |

---

## GenrePreferenceController
**Base Path:** `/genre-preference`

| HTTP Method | URL | Request DTO | Response DTO |
|-------------|-----|-------------|--------------|
| POST | `/genre-preference/save` | `GenrePreferenceRequest` | `Map<String, String>` |
| GET | `/genre-preference/saved-genres/{userId}` | Path Parameter: `userId` (Long) | `List<GenrePreferenceResponse>` |

---

## Summary
- **Total Controllers:** 6
- **Total Endpoints:** 16
- **GET Endpoints:** 7
- **POST Endpoints:** 6
- **PUT Endpoints:** 2
- **DELETE Endpoints:** 2

