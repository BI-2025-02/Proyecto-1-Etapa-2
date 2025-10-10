import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.metrics import classification_report

from model_pipeline import build_pipeline, load_current_model, save_model

app = FastAPI(title="API Clasificación ODS1", version="1.0")

class PredictionInput(BaseModel):
    textos: list[str]

class RetrainInput(BaseModel):
    textos: list[str]
    labels: list[int]

@app.post("/predict")
def predict(data: PredictionInput):
    model, vectorizer = load_current_model()
    X = vectorizer.transform(data.textos)
    preds = model.predict(X)
    return {"predicciones": preds.tolist()}

@app.post("/retrain")
def retrain(data: RetrainInput):
    try:
        model, vectorizer = load_current_model()
    except FileNotFoundError:
        print("No se encontró un modelo existente. Construyendo uno nuevo.")
        model = build_pipeline()
        vectorizer = model.named_steps["tfidf"]

    X_new = vectorizer.transform(data.textos)
    y_new = data.labels
    model.fit(X_new, y_new)
    save_model(model, vectorizer)

    report = classification_report(y_new, model.predict(X_new), output_dict=True)
    return {"mensaje": "Modelo reentrenado y actualizado", "f1_macro": report["macro avg"]["f1-score"]}

