import re
import html
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
# =========================================================
# LOAD MODEL
# =========================================================
model = joblib.load("fake_news_pipeline.pkl")
# =========================================================
# FASTAPI APP
# =========================================================
app = FastAPI(
    title="Fake News Detection API",
    description="Machine Learning API for detecting fake and true news",
    version="1.0.0"
)
# =========================================================
# CORS
# =========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# =========================================================
# SERVE FRONTEND STATIC FILES
# =========================================================
app.mount(
    "/static",
    StaticFiles(directory="frontend"),
    name="static"
)
# =========================================================
# TEXT CLEANING
# =========================================================
def clean_text(text):
    text = html.unescape(text)
    text = re.sub(
        r"according to reuters|via reuters",
        " ",
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r"\breuters\b",
        " ",
        text,
        flags=re.IGNORECASE
    )
    text = text.lower()
    text = re.sub(
        r"http\S+|www\S+",
        " ",
        text
    )
    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )
    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()
    return text
# =========================================================
# REQUEST MODEL
# =========================================================
class NewsRequest(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        max_length=500
    )
    text: str = Field(
        ...,
        min_length=20,
        max_length=50000
    )
# =========================================================
# HOME PAGE
# =========================================================
@app.get("/")
def home():
    return FileResponse(
        "frontend/index.html"
    )
# =========================================================
# HEALTH CHECK
# =========================================================
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "LinearSVC + TF-IDF"
    }
# =========================================================
# PREDICTION
# =========================================================
@app.post("/predict")
def predict_news(request: NewsRequest):
    combined_text = request.title + " " + request.text
    cleaned_text = clean_text(combined_text)
    prediction = model.predict([cleaned_text])[0]
    score = model.decision_function([cleaned_text])[0]
    if prediction == 0:
        result = "FAKE"
    else:
        result = "TRUE"

    return {
        "prediction": result,
        "decision_score": float(score)
    }