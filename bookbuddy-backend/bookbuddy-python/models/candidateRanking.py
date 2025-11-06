import requests
import pandas as pd
import xgboost
from typing import Dict

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes?"

# clean dto data & build features
def buildFeatures(book, readBookGenres, favGenres):
    userGenres = set(favGenres)

    if book.get("categories"):
        bookGenres = set(book.get("categories", []))
    else:     # some books in google books api don't have specific genres
        bookGenres = set()

    overlap = len(userGenres & bookGenres)
    union = len(userGenres | bookGenres)
    if union:
        similarity = overlap / union    # how similar user's book is to google books api selections
    else:
        similarity = 0

    rating = book.get("avgRating", 0) or 0
    normalizedRating = rating / 5    # feature data btn 0-1

    if book.get("pageCount"):
        pageCount = book.get("pageCount", 0)
    else:
        pageCount = 0

    if book.get("authors"):
        numAuthors = len(book.get("authors", []))
    else:
        numAuthors = 0

    return pd.Series({
        "genre_similarity": similarity,
        "normalized_rating": normalizedRating,
        "page_count": pageCount,
        "num_authors": numAuthors
    })

# generate candidates from google books
def generateCandidates(favGenres, readBookIDs, savedBookIDs, maxResults=20):
    candidates = []
    knownIDs = set(readBookIDs + savedBookIDs) # do we want saved books to still appear?
    
    for genre in favGenres:
        params = {
            "q": f"subject:{genre}", 
            "maxResults": maxResults, 
            "printType": "books"
        }
        
        response = requests.get(GOOGLE_BOOKS_URL, params=params)
        
        if response.status_code == 200:
            for volume in response.json().get("items", []):
                if volume.get("id") in knownIDs: # skip if book is saved or read
                    continue;
                
                info = volume.get("volumeInfo", {})
                book = {
                    "id": volume.get("id"),
                    "title": info.get("title"),
                    "authors": info.get("authors", []),
                    "categories": info.get("categories", []),
                    "pageCount": info.get("pageCount", 0),
                    "avgRating": info.get("averageRating", 0)
                }
                candidates.append(book) 
    return pd.DataFrame(candidates)

def getRanking(candidateDF, readBooks, favGenres):
    readBookGenres = []
    for book in readBooks:
        readBookGenres.extend(book.get("categories", []))
        
    featureDF = candidateDF.apply(lambda row: buildFeatures(row, readBookGenres, favGenres), axis=1)
    candidateDF = candidateDF.join(featureDF)
    candidateDF["label"] = 0    # candidate = 0, read = 1
    featureCols = ["genreSimilarity", "normalizedRating", "pageCount", "numAuthors"]
    
    rankedDF = train(candidateDF, featureCols)
    return rankedDF
    
    
def train(candidateDF, featureCols):
    X = candidateDF[featureCols].values
    y = candidateDF["label"].values
    dtrain = xgboost.DMatrix(X, label=y)
    
    params = {
        "objective": "rank:pairwise",
        "eval_metric": "ndcg",
        "eta": 0.1,
        "max_depth": 4
    }
    
    bst = xgboost.train(params, dtrain, num_boost_round=100)
    candidateDF["rank"] = bst.predict(dtrain)
    return candidateDF.sort_values("rank", ascending=False)