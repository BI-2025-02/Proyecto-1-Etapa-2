import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.metrics import classification_report
from sklearn.metrics import classification_report, precision_recall_fscore_support, accuracy_score
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

    # Predicciones sobre el mismo set usado para fit (métricas de entrenamiento)
    y_pred = model.predict(X_new)

    # Macro (promedio por clases, mismo peso por clase)
    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(
        y_new, y_pred, average="macro", zero_division=0
    )

    # (Opcional) otras vistas útiles:
    acc = accuracy_score(y_new, y_pred)
    prec_micro, rec_micro, f1_micro, _ = precision_recall_fscore_support(y_new, y_pred, average="micro", zero_division=0)
    prec_w, rec_w, f1_w, _ = precision_recall_fscore_support(y_new, y_pred, average="weighted", zero_division=0)

    # Reporte por clase (si lo quieres mantener)
    report = classification_report(y_new, y_pred, output_dict=True, zero_division=0)

    return {
        "mensaje": "Modelo reentrenado y actualizado",
        "metrics": {
            "precision_macro": prec_macro,
            "recall_macro": rec_macro,
            "f1_macro": f1_macro,
            "accuracy": acc,                 # ← descomenta si lo quieres
            "precision_micro": prec_micro,   # ← opcional
            "recall_micro": rec_micro,       # ← opcional
            "f1_micro": f1_micro,            # ← opcional
            "precision_weighted": prec_w,    # ← opcional
            "recall_weighted": rec_w,        # ← opcional
            "f1_weighted": f1_w,              # ← opcional
            "classification_report": report    # sigue disponible por clase
        }
    }

