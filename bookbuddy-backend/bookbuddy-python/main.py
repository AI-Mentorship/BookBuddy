import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from models.candidateRanking import generateCandidates, getRanking
from models.llm import analyzeReview

app = FastAPI()

class BookDTO(BaseModel):
    googleBooksId: str
    title: str
    authors: List[str] = None
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

    rankedDF = getRanking(candidateDF, readBooks, favGenres)
    recommendedBookIds = rankedDF.head(40)["id"].tolist()

    return LLMResponse(recommendedBookIds=recommendedBookIds)

# DELETE AFTER TESTING
@app.post("/ml/analyzeReview")
def reviewEndpoint(review: dict):
    text = review.get("text", "")
    return analyzeReview(text)