# main
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
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

@app.post("/ml/recommendations", response_model=LLMResponse)
def recommendBooks(request: LLMRequest):
    readBooks = [book.dict() for book in request.readBookData]
    readBookIDs = [book.googleBooksId for book in request.readBookData if book.googleBooksId]
    savedBookIDs = [book.googleBooksId for book in request.savedBookData if book.googleBooksId]
    favGenres = [g.genre for g in request.genrePreferenceData]

    candidateDF = generateCandidates(
        favGenres=favGenres,
        readBookIDs=readBookIDs,
        savedBookIDs=savedBookIDs,
        candidateBooks=None
    )

    reviewsMap = {}
    for book in request.readBookData + request.savedBookData:
        if book.googleBooksId and book.review:
            reviewsMap[book.googleBooksId] = book.review
    candidateDF["review"] = candidateDF["id"].map(lambda x: reviewsMap.get(x, ""))

    rankedDF = getRanking(
        favGenres=favGenres,
        readBookIDs=readBookIDs,
        savedBookIDs=savedBookIDs,
        topN=40,
        candidateDF=candidateDF
    )
    recommendedBookIds = rankedDF.head(40)["id"].tolist()

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