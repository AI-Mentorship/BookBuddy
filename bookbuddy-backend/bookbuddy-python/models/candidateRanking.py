import requests
import pandas as pd
import xgboost as xgb
from typing import List, Dict
from .llm import analyzeReview
import os

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes?"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "book_ranker.json")

# load trained model
ranker_model = xgb.Booster()
ranker_model.load_model(MODEL_PATH)

def fetchCandidates(favGenres: List[str], maxResults: int = 20) -> List[Dict]:
    candidates = []
    for genre in favGenres:
        params = {"q": f"subject:{genre}", "maxResults": maxResults, "printType": "books"}
        response = requests.get(GOOGLE_BOOKS_URL, params=params)
        if response.status_code == 200:
            for item in response.json().get("items", []):
                info = item.get("volumeInfo", {})
                book = {
                    "id": item.get("id"),
                    "title": info.get("title"),
                    "authors": info.get("authors", []),
                    "categories": info.get("categories", []),
                    "pageCount": info.get("pageCount", 0),
                    "avgRating": info.get("averageRating", 0),
                    "description": info.get("description", "")
                }
                candidates.append(book)
    return candidates

def buildFeatures(book: Dict, favGenres: List[str]) -> pd.Series:
    userGenres = set(favGenres)
    bookGenres = set(book.get("categories", [])) if book.get("categories") else set()

    overlap = len(userGenres & bookGenres)
    union = len(userGenres | bookGenres)
    genreSimilarity = overlap / union if union else 0

    rating = book.get("avgRating", 0) or 0
    normalizedRating = rating / 5

    pageCount = book.get("pageCount", 0)

    numAuthors = len(book.get("authors", [])) if book.get("authors") else 0

    review = book.get("review", "")
    if review:
        sentiment = analyzeReview(review)
        sentimentRating = sentiment["rating"] / 5
    else:
        sentimentRating = 0.5

    return pd.Series({
        "genreSimilarity": genreSimilarity,
        "normalizedRating": normalizedRating,
        "pageCount": pageCount,
        "numAuthors": numAuthors,
        "sentimentRating": sentimentRating
    })

def generateCandidates(favGenres, readBookIDs, savedBookIDs, maxResults=20, candidateBooks=None):
    candidates = []
    knownIDs = set(readBookIDs + savedBookIDs)

    if candidateBooks is None:
        for genre in favGenres:
            params = {
                "q": f"subject:{genre}",
                "maxResults": maxResults,
                "printType": "books"
            }
            response = requests.get(GOOGLE_BOOKS_URL, params=params)
            if response.status_code == 200:
                for volume in response.json().get("items", []):
                    book_id = volume.get("id")
                    if book_id in knownIDs:
                        continue
                    info = volume.get("volumeInfo", {})
                    candidates.append({
                        "id": book_id,
                        "title": info.get("title"),
                        "authors": info.get("authors", []),
                        "categories": info.get("categories", []),
                        "pageCount": info.get("pageCount", 0),
                        "avgRating": info.get("averageRating", 0)
                    })
    else:
        for book in candidateBooks:
            if book.get("id") not in knownIDs:
                candidates.append(book)

    return pd.DataFrame(candidates)

def rankCandidates(candidateDF: pd.DataFrame, favGenres: List[str]) -> pd.DataFrame:
    if candidateDF.empty:
        return candidateDF

    featureDF = candidateDF.apply(lambda row: buildFeatures(row, favGenres), axis=1)
    candidateDF = candidateDF.join(featureDF)
    featureCols = ["genreSimilarity", "normalizedRating", "pageCount", "numAuthors", "sentimentRating"]
    dmatrix = xgb.DMatrix(candidateDF[featureCols].values)

    candidateDF["rankScore"] = ranker_model.predict(dmatrix)

    return candidateDF.sort_values("rankScore", ascending=False)

def getRanking(favGenres: List[str], readBookIDs: List[str], savedBookIDs: List[str], topN: int = 20) -> pd.DataFrame:
    candidateDF = generateCandidates(favGenres, readBookIDs, savedBookIDs)
    rankedDF = rankCandidates(candidateDF, favGenres)
    return rankedDF.head(topN)