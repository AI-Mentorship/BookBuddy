import requests

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes/"

def validateGoogleBooksData(data):
    if "error" in data:
        return False

    volume = data.get("volumeInfo")
    if not volume:
        return False

    if volume.get("language") != "en":
        return False

    title = volume.get("title", "").strip().lower()
    if not title or title in ["error", "untitled"]:
        return False

    if not volume.get("publishers"):
        return False

    if not volume.get("description"):
        return False



    return True

def isValidGoogleBook(bookId: str) -> bool:
    try:
        response = requests.get(f"{GOOGLE_BOOKS_URL}{bookId}")
        if response.status_code != 200:
            return False
        data = response.json()
        return validateGoogleBooksData(data)
    except requests.RequestException:
        return False