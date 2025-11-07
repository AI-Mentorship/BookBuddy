from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from models.candidateRanking import generateCandidates, getRanking

app = FastAPI()

class BookDTO(BaseModel):
    googleBooksId: str
    title: str
    authors: List[str] = None
    pageCount: int = None
    categories: List[str] = None
    averageRating: float = None

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
    readBookIDs = [book.googleBooksId for book in request.readBookData]
    saveBookIDs = [book.googleBooksId for book in request.savedBookData]
    favGenres = [g.genres for g in request.genrePreferenceData]
    
    candidateDF = generateCandidates(favGenres, readBookIDs, saveBookIDs)
    rankedDF = getRanking(candidateDF, readBooks, favGenres)
    
    # top 40 books (google books only shows 40 max)
    recommendedBookIds = rankedDF.head(40)["id"].tolist()
    return LLMResponse(recommendedBookIds=recommendedBookIds)