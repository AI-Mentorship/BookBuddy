# candidateRanking
import requests
import pandas as pd
import xgboost as xgb
from typing import List, Dict
from .llm import analyzeReview
from ..utils.googleBooksUtils import validateGoogleBooksData
import os

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes?"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "bookRankerModel.bin")

# load trained model
ranker_model = xgb.Booster()
ranker_model.load_model(MODEL_PATH)

def getGoogleBooksData(genre: str, maxResults: int = 20):
    params = {
        "q" : f"subject:{genre}",
        "maxResults" : maxResults,
        "printType" : "books",
        "langRestrict" : "en"
    }

    response = requests.get(GOOGLE_BOOKS_URL, params=params)

    if response.status_code == 200:   # GET successful
        data = []
        for volume in response.json().get("items", []):
            if validateGoogleBooksData(volume):
                info = volume.get("volumeInfo", {})
                data.append({
                    "title" : info.get("title"),
                    "authors" : info.get("authors"),
                    "publishers" : info.get("publishers"),
                    "desc" : info.get("description"),
                    "categories" : info.get("categories"),
                    "pageCount" : info.get("pageCount"),
                    "avgRating" : info.get("averageRating"),
                    "maturity" : info.get("maturityRating"),
                    "language": info.get("language"),
                    "id": volume.get("id")
                })
        return data
    else:
        print('Error', response.status_code)
        return []


def fetchCandidates(favGenres: List[str], maxResults: int = 20) -> List[Dict]:
    candidates = []
    for genre in favGenres:
        books = getGoogleBooksData(genre)
        candidates.extend(books)
    return candidates

# def buildFeatures(book: Dict, favGenres: List[str]) -> pd.Series:
#     userGenres = set(favGenres)
#     bookGenres = set(book.get("categories", [])) if book.get("categories") else set()
#
#     overlap = len(userGenres & bookGenres)
#     union = len(userGenres | bookGenres)
#     genreSimilarity = overlap / union if union else 0
#
#     rating = book.get("avgRating", 0) or 0
#     normalizedRating = rating / 5
#
#     pageCount = book.get("pageCount", 0)
#
#     numAuthors = len(book.get("authors", [])) if book.get("authors") else 0
#
#     review = book.get("review", "")
#     if review:
#         sentiment = analyzeReview(review)
#         sentimentRating = sentiment["rating"] / 5
#     else:
#         sentimentRating = 0.5
#
#     return pd.Series({
#         "genreSimilarity": genreSimilarity,
#         "normalizedRating": normalizedRating,
#         "pageCount": pageCount,
#         "numAuthors": numAuthors,
#         "sentimentRating": sentimentRating
#     })

def buildFeatures(book: pd.Series, favGenres: List[str]) -> pd.Series:
    userGenres = set(favGenres)
    bookGenres = set(book["categories"]) if book["categories"] else set()

    overlap = len(userGenres & bookGenres)
    union = len(userGenres | bookGenres)
    genreSimilarity = overlap / union if union else 0

    rating = book["avgRating"] or 0
    normalizedRating = rating / 5

    # pageCount = book["pageCount"] or 0
    numAuthors = len(book["authors"]) if book["authors"] else 0

    review = book.get("review", "")
    sentimentRating = analyzeReview(review)["rating"] / 5 if review else 0.5

    return pd.Series({
        "genreSimilarity": genreSimilarity,
        "normalizedRating": normalizedRating,
        # "pageCount": pageCount,
        "numAuthors": numAuthors,
        "sentimentRating": sentimentRating
    })


def generateCandidates(favGenres, readBookIDs, savedBookIDs, maxResults=20, candidateBooks=None):
    knownIDs = set(readBookIDs + savedBookIDs)
    candidates = []

    if candidateBooks is None:
        allCandidates = fetchCandidates(favGenres, maxResults=maxResults)
        for book in allCandidates:
            if book["id"] not in knownIDs:
                candidates.append(book)
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
    dmatrix = xgb.DMatrix(candidateDF[featureCols], feature_names=featureCols)

    candidateDF["rankScore"] = ranker_model.predict(dmatrix)

    return candidateDF.sort_values("rankScore", ascending=False)

def getRanking(favGenres: List[str], readBookIDs: List[str], savedBookIDs: List[str], topN: int = 20, candidateDF=None) -> pd.DataFrame:
    if candidateDF is None:
        candidateDF = generateCandidates(favGenres, readBookIDs, savedBookIDs)
    rankedDF = rankCandidates(candidateDF, favGenres)
    return rankedDF.head(topN)