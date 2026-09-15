 Fake News Detection System

An end-to-end NLP and Machine Learning application that classifies news articles as FAKE or TRUE using text-based machine learning.

The project combines text preprocessing, TF-IDF feature extraction, Linear SVM classification, model evaluation, and FastAPI deployment into a complete web application.

 Overview

The system takes a news headline and article content as input and predicts whether the article is:

🔴 FAKE
🟢 TRUE

The trained machine learning pipeline is integrated with a FastAPI backend and a responsive HTML/CSS/JavaScript frontend.

Tech Stack

Language

Python

NLP & Machine Learning

Pandas
NumPy
Scikit-learn
TF-IDF
Linear SVM
Logistic Regression
Multinomial Naive Bayes

Backend

FastAPI
Uvicorn
Pydantic
Joblib

Frontend

HTML5
CSS3
JavaScript
 Methods Used
1. Data Preprocessing

The news data was prepared using:

Combining headline and article text
Duplicate removal
Publisher/header cleaning
Lowercasing
URL removal
Unnecessary character removal
Text normalization
2. TF-IDF Vectorization

TF-IDF (Term Frequency-Inverse Document Frequency) was used to convert news text into numerical features.

Configuration:

TfidfVectorizer(
    max_features=30000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.95,
    sublinear_tf=True,
    strip_accents="unicode"
)

Both unigrams and bigrams were used to capture individual words as well as meaningful word combinations.

3. Classification Models

Three classification algorithms were evaluated:

Model	Purpose
Linear SVM	Final classification model
Logistic Regression	Baseline/comparison
Multinomial Naive Bayes	Model comparison

Linear SVM was selected as the final model based on evaluation performance.

4. Stratified Train-Test Split

A stratified 80/20 split was used to maintain the FAKE/TRUE class distribution between training and testing data.

5. Cross-Validation

5-Fold Stratified Cross-Validation was performed to evaluate model consistency across multiple validation folds.

6. Evaluation

The models were evaluated using:

Accuracy
Precision
Recall
F1-Score
Confusion Matrix
 Dataset

The project uses two datasets:

Dataset	Articles
Fake.csv	23,481
True.csv	21,417
Total	44,898

The original dataset contains:

title
text
subject
date
label

For classification, the title and article text were combined.

Labels:

0 → FAKE
1 → TRUE
 Model Performance
Model Comparison
Model	Accuracy	Precision	Recall	F1-Score
Linear SVM	99.67%	99.67%	99.67%	99.67%
Logistic Regression	99.31%	99.31%	99.31%	99.31%
Multinomial Naive Bayes	95.77%	95.77%	95.77%	95.77%
5-Fold Cross-Validation

Linear SVM achieved approximately:

Accuracy: 99.62%
Precision: 99.62%
Recall: 99.62%
F1-Score: 99.62%
Final Test Set

The final Linear SVM achieved:

Accuracy: 99.67%
Precision: 99.62%
Recall: 99.76%
F1-Score: 99.69%

Confusion Matrix:

[[3566   16]
 [  10 4229]]

These metrics represent performance on the dataset's evaluation split and should not be interpreted as guaranteed real-world accuracy.

Data Leakage Check

News datasets can contain publisher or source-specific patterns. Therefore, the project included a Reuters-related leakage check and removed publisher/header information during preprocessing.

An additional experiment reducing explicit Reuters tokens still produced approximately 99.49% F1-score, indicating that the explicit Reuters token alone did not account for the model's performance.

Dataset-specific source and writing-style patterns may still influence results.

 Model Pipeline

The final TF-IDF + Linear SVM pipeline is saved as:

fake_news_pipeline.pkl

The complete pipeline is serialized with Joblib, allowing the same trained text representation and classifier to be reused during deployment.