import datetime
import os

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CURRENT_MODEL_PATH = os.path.join(BASE_DIR, "../models/model_current.joblib")
CURRENT_VECTORIZER_PATH = os.path.join(BASE_DIR, "../models/tfidf_current.joblib")


def build_pipeline():
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1,2), 
            min_df=3, 
            max_df=0.9, 
            sublinear_tf=True, 
            norm="l2"
        )),
        ("clf", LogisticRegression(
            max_iter=2000, 
            class_weight="balanced", 
            random_state=42,
            solver="lbfgs"
        ))
    ])

def load_current_model():
    model = joblib.load(CURRENT_MODEL_PATH)
    vectorizer = joblib.load(CURRENT_VECTORIZER_PATH)
    return model, vectorizer

def save_model(model, vectorizer, path_model=CURRENT_MODEL_PATH, path_vec=CURRENT_VECTORIZER_PATH):
    joblib.dump(model, path_model)
    joblib.dump(vectorizer, path_vec)
    
def save_model_versioned(model, vectorizer):
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    model_path = f"models/model_{timestamp}.joblib"
    vec_path = f"models/tfidf_{timestamp}.joblib"
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vec_path)
    return model_path

