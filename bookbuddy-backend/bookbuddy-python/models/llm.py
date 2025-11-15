from transformers import pipeline
from huggingface_hub import InferenceClient

HF_TOKEN = ""

sentiment_analyzer = pipeline(
    "text-classification",
    model="j-hartmann/sentiment-roberta-large-english-3-classes"
)

client = InferenceClient(api_key=HF_TOKEN)

sentiment_map = {"NEGATIVE": 1, "NEUTRAL": 3, "POSITIVE": 5}

def analyzeReview(review):
    if not review:
        return {
            "sentiment": "neutral",
            "sentiment_score": 0,
            "rating": 0,
            "keywords": "",
        }

    # sentiment analysis
    sentiment = sentiment_analyzer(review)[0]
    sentiment_label = sentiment['label']
    sentiment_score = sentiment['score']
    rating = sentiment_map.get(sentiment_label, 3)

    # llm response
    response = client.chat_completion(
        model="HuggingFaceH4/zephyr-7b-beta",
        messages=[
            {"role": "system", "content": "Your role is to extract themes and topics from book reviews, separated by commas."},
            {"role": "user", "content": f"{review}"}
        ],
        max_tokens=100,
    )
    keywords = response.choices[0].message["content"].strip()

    print("Sentiment:", sentiment_label, f"({sentiment_score:.2f})")
    print("Approximate rating:", rating, "/ 5")
    print("Keywords/Themes:", keywords)

    # output
    return {
        "sentiment": sentiment_label,
        "sentiment_score": round(sentiment_score, 2),
        "rating": rating,
        "keywords": keywords,
    }