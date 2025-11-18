import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from collections import Counter
from bookbuddy_python.models.candidateRanking import generateCandidates, getRanking
from bookbuddy_python.models.llm import analyzeReview
from bookbuddy_python.utils.googleBooksUtils import isValidGoogleBook

app = FastAPI()

class BookDTO(BaseModel):
    googleBooksId: str
    title: str
    authors: List[str] = None
    publishers: List[str] = None
    pageCount: int = None
    categories: List[str] = None
    averageRating: float = None
    review: str = None
    description: str = None

class GenrePreferenceResponse(BaseModel):
    genre: str

class LLMRequest(BaseModel):
    savedBookData: List[BookDTO]
    readBookData: List[BookDTO]
    genrePreferenceData: List[GenrePreferenceResponse]

class LLMResponse(BaseModel):
    recommendedBookIds: List[str]

class ValidationRequest(BaseModel):
    googleBooksIds: List[str]

def inferGenresFromBooks(readBooks: list, limit: int = 5) -> list:
    genreCounter = Counter()
    for book in readBooks:
        bookData = book.dict() if hasattr(book, "dict") else book
        for g in bookData.get("categories") or []:
            genreCounter[g.lower().strip()] += 1
    return [genre for genre, count in genreCounter.most_common(limit)]

@app.post("/ml/recommendations", response_model=LLMResponse)
def recommendBooks(request: LLMRequest):
    readBooks = [{**book.dict(), "id": book.googleBooksId} for book in request.readBookData]
    print("read books: ", readBooks)
    savedBooks = [{**book.dict(), "id": book.googleBooksId} for book in request.savedBookData]
    print("saved books: ", savedBooks)

    favGenres = [g.genre for g in request.genrePreferenceData]
    if not favGenres:
        favGenres = inferGenresFromBooks(request.readBookData)
    print("fav genres: ", favGenres)

    candidateDF = generateCandidates(
        favGenres=favGenres,
        readBooks=readBooks,
        savedBooks=savedBooks,
        candidateBooks=None
    )
    print("Candidate DF:", candidateDF)

    if "id" not in candidateDF.columns:
        candidateDF["id"] = candidateDF.apply(lambda row: row.get("book_id") or row.get("googleBooksId") or None, axis=1)

    reviewsMap = {b["id"]: b.get("review", "") for b in readBooks + savedBooks if b.get("review")}
    candidateDF["review"] = candidateDF["id"].map(lambda x: reviewsMap.get(x, ""))

    rankedDF = getRanking(
        favGenres=favGenres,
        readBooks=readBooks,
        savedBooks=savedBooks,
        limit=40,
        candidateDF=candidateDF
    )
    print("Ranked DF:", rankedDF)

    recommendedBookIds = rankedDF["id"].tolist()

    return LLMResponse(recommendedBookIds=recommendedBookIds)

@app.post("/validateBooks")
def validateAPIData(request: ValidationRequest):
    validatedBooks = {}
    for bookId in request.googleBooksIds:
        validatedBooks[bookId] = isValidGoogleBook(bookId)
    return validatedBooks


# DELETE AFTER TESTING
@app.post("/ml/analyzeReview")
def reviewEndpoint(review: dict):
    text = review.get("text", "")
    return analyzeReview(text)