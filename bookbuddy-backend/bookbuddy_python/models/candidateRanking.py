#candidateRanking
import requests
import pandas as pd
import xgboost as xgb
from typing import List, Dict
from .llm import analyzeReview
from ..utils.googleBooksUtils import validateGoogleBooksData
import os
import pickle
from scipy.sparse import load_npz
from sklearn.metrics.pairwise import cosine_similarity

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes?"
#MODEL_PATH = os.path.join(os.path.dirname(__file__), "bookRankerModel.bin")
ASSETS_PATH = os.path.join(os.path.dirname(__file__), "..", "assets")

# TF-IDF vectorizer
with open(os.path.join(ASSETS_PATH, "tfidf_vectorizer.pkl"), "rb") as f:
    tfidf_vectorizer = pickle.load(f)

# XGBoost model
MODEL_PATH = os.path.join(ASSETS_PATH, "book_ranker_phase1.model")
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
        items = response.json().get("items", [])
        print(f"Fetched {len(items)} items from Google Books for genre {genre}")
        for volume in items:
            valid = validateGoogleBooksData(volume)
            print(volume.get("id"), "valid?", valid)
            if validateGoogleBooksData(volume):
                info = volume.get("volumeInfo", {})
                data.append({
                    "id": volume.get("id"),
                    "title": info.get("title"),
                    "authors": info.get("authors"),
                    "publishers": info.get("publisher"),
                    "description": info.get("description"),
                    "categories": info.get("categories"),
                    "pageCount": info.get("pageCount"),
                    "avgRating": info.get("averageRating"),
                    "maturity": info.get("maturityRating"),
                    "language": info.get("language"),
                    "review": ""
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

def computeSimilarity(candidate_text: str, reference_texts: List[str]) -> float:
    if not reference_texts:
        return 0.0

    candidate_vec = tfidf_vectorizer.transform([candidate_text])
    ref_vecs = tfidf_vectorizer.transform(reference_texts)
    sims = cosine_similarity(candidate_vec, ref_vecs)
    return float(sims.max())

def buildFeatures(book: pd.Series, favGenres: list, readBooks: List[Dict], savedBooks: List[Dict]) -> pd.Series:
    userGenres = set(favGenres)
    bookGenres = set(book["categories"]) if book["categories"] else set()

    # genre similarity
    overlap = len(userGenres & bookGenres)
    union = len(userGenres | bookGenres)
    genreSimilarity = overlap / union if union else 0

    # normalize rating
    rating = book["avgRating"] or 0
    normalizedRating = rating / 5

    # pageCount = book["pageCount"] or 0
    numAuthors = len(book["authors"]) if book["authors"] else 0

    review = book.get("review", "")
    sentimentRating = analyzeReview(review)["rating"] / 5 if review else 0.5

    # TF-IDF similarity features
    book_text = (book.get("title") or "") + " " + (book.get("description") or "")
    read_texts = [(b.get("title") or "") + " " + (b.get("description") or "") for b in readBooks]
    saved_texts = [(b.get("title") or "") + " " + (b.get("description") or "") for b in savedBooks]

    similarityToRead = computeSimilarity(book_text, read_texts)
    similarityToSaved = computeSimilarity(book_text, saved_texts)


    return pd.Series({
        "genreSimilarity": genreSimilarity,
        "normalizedRating": normalizedRating,
        # "pageCount": pageCount,
        "numAuthors": numAuthors,
        "sentimentRating": sentimentRating,
        "similarityToRead": similarityToRead,
        "similarityToSaved": similarityToSaved
    })


def generateCandidates(favGenres, readBooks, savedBooks, maxResults=20, candidateBooks=None):
    knownIDs = {b["id"] for b in readBooks + savedBooks}
    candidates = []

    if candidateBooks is None:
        allCandidates = fetchCandidates(favGenres, maxResults=maxResults)
    else:
        allCandidates = candidateBooks

    for book in allCandidates:
        book_id = book.get("book_id") or book.get("id")
        book["id"] = book_id
        if book_id not in knownIDs:
            candidates.append(book)

    return pd.DataFrame(candidates)

def rankCandidates(candidateDF: pd.DataFrame, favGenres: list, readBooks: list, savedBooks: list) -> pd.DataFrame:
    if candidateDF.empty:
        return candidateDF

    featuresDF = candidateDF.apply(lambda row: buildFeatures(row, favGenres, readBooks, savedBooks), axis=1)
    candidateDF = candidateDF.join(featuresDF)

    featureCols = ["genreSimilarity", "normalizedRating", "numAuthors",
                   "sentimentRating", "similarityToRead", "similarityToSaved"]

    dmatrix = xgb.DMatrix(candidateDF[featureCols], feature_names=featureCols)
    candidateDF["rankScore"] = ranker_model.predict(dmatrix)

    return candidateDF.sort_values("rankScore", ascending=False)

def getRanking(favGenres: List[str], readBooks: List[Dict], savedBooks: List[Dict], limit: int = 20, candidateDF=None) -> pd.DataFrame:
    if candidateDF is None:
        candidateDF = generateCandidates(favGenres, readBooks, savedBooks)
    rankedDF = rankCandidates(candidateDF, favGenres, readBooks, savedBooks)
    return rankedDF.head(limit)
