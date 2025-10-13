import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.metrics import (accuracy_score, classification_report,
                             precision_recall_fscore_support)
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from model_pipeline import build_pipeline, load_current_model, save_model

app = FastAPI(title="API Clasificación ODS1", version="1.0")

# Allow the frontend dev server to call this API (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    textos: list[str]

class RetrainInput(BaseModel):
    textos: list[str]
    # Accept labels as strings too (Excel/CSV commonly contains text labels)
    labels: list[str]
    
@app.get("/health", summary="Estado de la API", tags=["Sistema"])
def health():
    try:
        model, _ = load_current_model()
        return {"status": "ok", "model_loaded": True}
    except Exception as e:
        return {"status": "error", "model_loaded": False, "detail": str(e)}


@app.post("/predict")
def predict(data: PredictionInput):
    model, vectorizer = load_current_model()
    X = vectorizer.transform(data.textos)
    preds = model.predict(X)
    return {"predicciones": preds.tolist()}

@app.post("/retrain")
def retrain(data: RetrainInput):
    # Debug: log basic info about incoming payload
    try:
        print(f"/retrain received textos={len(data.textos)} labels={len(data.labels)} sample_label={data.labels[0] if data.labels else 'N/A'}")
    except Exception:
        pass
    # Convert inputs
    textos = list(data.textos)
    y = list(data.labels)

    if len(textos) < 2:
        return {"mensaje": "Se requieren al menos 2 ejemplos para reentrenar."}

    # Prepare split; if only one class present, do non-stratified split
    unique_labels = set(y)
    stratify = y if len(unique_labels) > 1 else None

    try:
        X_train_texts, X_test_texts, y_train, y_test = train_test_split(
            textos, y, test_size=0.2, random_state=42, stratify=stratify
        )
    except ValueError:
        X_train_texts, X_test_texts, y_train, y_test = train_test_split(
            textos, y, test_size=0.2, random_state=42
        )

    # Fit vectorizer on training data only
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=3, max_df=0.9, sublinear_tf=True, norm="l2")
    X_train = vectorizer.fit_transform(X_train_texts)
    X_test = vectorizer.transform(X_test_texts)

    clf = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=42, solver="lbfgs")
    clf.fit(X_train, y_train)

    # Save model and vectorizer
    save_model(clf, vectorizer)

    # Evaluate on held-out test set
    y_pred = clf.predict(X_test)

    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)
    acc = accuracy_score(y_test, y_pred)
    prec_micro, rec_micro, f1_micro, _ = precision_recall_fscore_support(y_test, y_pred, average="micro", zero_division=0)
    prec_w, rec_w, f1_w, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)

    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    return {
        "mensaje": "Modelo reentrenado y actualizado",
        "metrics": {
            "precision_macro": prec_macro,
            "recall_macro": rec_macro,
            "f1_macro": f1_macro,
            "accuracy": acc,
            "precision_micro": prec_micro,
            "recall_micro": rec_micro,
            "f1_micro": f1_micro,
            "precision_weighted": prec_w,
            "recall_weighted": rec_w,
            "f1_weighted": f1_w,
            "classification_report": report,
        },
        "train_size": len(X_train_texts),
        "test_size": len(X_test_texts),
    }

