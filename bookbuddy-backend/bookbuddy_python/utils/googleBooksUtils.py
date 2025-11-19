# utils
import requests

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes/"

def validateGoogleBooksData(data):
    if "error" in data:
        print(data.get("id"), ": error in data")
        return False

    volume = data.get("volumeInfo")
    if not volume:
        print(data.get("id"), ": no volumeInfo")
        return False

    if volume.get("language") != "en":
        print(data.get("id"), ": not in english")
        return False

    title = volume.get("title", "").strip().lower()
    if not title or title in ["error", "untitled"]:
        print(data.get("id"), ": title is ", title)
        return False

    if not volume.get("publisher"):
        print(data.get("id"), ": no publishers")
        return False

    if not volume.get("description"):
        print(data.get("id"), ": no desc")
        return False

    image_links = volume.get("imageLinks")
    if not image_links:
        print(data.get("id"), ": no imageLinks")
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
        