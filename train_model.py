# train_model.py — Standalone training script for CoalGuard AI MVP
import os
import json
import warnings
import numpy as np
import pandas as pd
import networkx as nx
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score
from sklearn.neighbors import NearestNeighbors

warnings.filterwarnings("ignore")
RANDOM_STATE = 42
DATA_PATH = "india_coal_mine_safety_data_source_grounded.csv"
MODEL_PATH = "coalguard_ai_mvp_risk_model.pkl"

def main():
    print("Loading dataset from:", DATA_PATH)
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Please ensure it is in the working directory.")
    
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset loaded successfully. Shape: {df.shape}")

    # 1. Create proxy risk label for MVP classification
    risk_score = (
        0.20 * (100 - df["compliance_rate"].clip(0, 100)) +
        0.15 * (100 - df["inspection_completion_rate"].clip(0, 100)) +
        0.15 * df["environmental_breach_rate"].clip(0, 100) +
        0.15 * np.minimum(df["overdue_violation_count"] / 10 * 100, 100) +
        0.10 * np.minimum(df["repeat_violation_count"] / 10 * 100, 100) +
        0.10 * np.minimum(df["serious_incident_count"] / 5 * 100, 100) +
        0.05 * np.minimum(df["overdue_action_count"] / 15 * 100, 100) +
        0.05 * np.minimum(df["critical_compliance_gap"] / 15 * 100, 100) +
        0.05 * df["neighbor_zone_risk"].clip(0, 100) +
        0.02 * np.minimum(df["critical_violation_count"] / 5 * 100, 100)
    ).clip(0, 100)

    df["proxy_risk_score"] = risk_score
    df["risk_label"] = pd.cut(
        df["proxy_risk_score"],
        bins=[-np.inf, 30, 40, np.inf],
        labels=["LOW", "MEDIUM", "HIGH"]
    )

    # 2. Build NetworkX / NearestNeighbors similarity graph features
    graph_base_cols = [
        c for c in df.select_dtypes(include=np.number).columns
        if c not in ["proxy_risk_score"]
    ]

    X_graph = df[graph_base_cols].copy()
    X_graph = X_graph.fillna(X_graph.median(numeric_only=True))
    graph_scaled = (X_graph - X_graph.mean()) / X_graph.std(ddof=0).replace(0, 1)

    K = 5
    nn = NearestNeighbors(n_neighbors=K + 1, metric="euclidean")
    nn.fit(graph_scaled)
    _, indices = nn.kneighbors(graph_scaled)
    neighbors = indices[:, 1:]

    df["graph_degree"] = K
    df["graph_mean_neighbor_compliance_rate"] = df["compliance_rate"].to_numpy()[neighbors].mean(axis=1)
    df["graph_mean_neighbor_violation_count_30d"] = df["total_violation_count_30d"].to_numpy()[neighbors].mean(axis=1)
    df["graph_mean_neighbor_environmental_breach_rate"] = df["environmental_breach_rate"].to_numpy()[neighbors].mean(axis=1)
    df["graph_mean_neighbor_action_delay_days"] = df["average_action_delay_days"].to_numpy()[neighbors].mean(axis=1)

    # 3. Assemble ML Feature Matrix with EXPLICIT categorical separation
    DROP_COLUMNS = ["mine_id", "proxy_risk_score", "risk_label"]
    feature_cols = [c for c in df.columns if c not in DROP_COLUMNS]
    
    categorical_cols = ["state", "mine_type", "coal_type"]
    numeric_cols = [c for c in feature_cols if c not in categorical_cols]

    print(f"Total features: {len(feature_cols)} | Numeric: {len(numeric_cols)} | Categorical: {len(categorical_cols)}")

    X = df[feature_cols].copy()
    y = df["risk_label"].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )

    # 4. Preprocessing and Model Training
    preprocessor = ColumnTransformer([
        ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), numeric_cols),
        ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), categorical_cols)
    ])

    print("Training Random Forest Classifier...")
    rf_pipeline = Pipeline([
        ("prep", preprocessor),
        ("model", RandomForestClassifier(n_estimators=400, min_samples_leaf=2, class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1))
    ])
    rf_pipeline.fit(X_train, y_train)
    rf_pred = rf_pipeline.predict(X_test)
    print("Random Forest Weighted F1:", f1_score(y_test, rf_pred, average="weighted"))

    best_name = "Random Forest"
    classes = np.array(sorted(y.unique()))

    # 5. Save Model Artifact (.pkl)
    artifact = {
        "project": "CoalGuard AI",
        "artifact_version": "MVP-1.0",
        "model_type": best_name,
        "target": "risk_label",
        "feature_columns": feature_cols,
        "numeric_cols": numeric_cols,
        "categorical_cols": categorical_cols,
        "classes": classes.tolist(),
        "model": rf_pipeline,
        "fitted_preprocessor": preprocessor,
        "training_row_count": len(df)
    }

    joblib.dump(artifact, MODEL_PATH)
    print(f"Model artifact successfully saved to: {MODEL_PATH}")

if __name__ == "__main__":
    main()