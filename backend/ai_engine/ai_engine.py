import os
from functools import lru_cache
from typing import List, Tuple, Dict

import numpy as np
from sentence_transformers import SentenceTransformer  # type: ignore
from sklearn.cluster import KMeans  # type: ignore
import spacy  # type: ignore


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    model_name = os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    return SentenceTransformer(model_name)


@lru_cache(maxsize=1)
def get_nlp():
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        # Fallback to blank model if language model is not installed
        return spacy.blank("en")


def generate_embedding(text: str) -> np.ndarray:
    model = get_model()
    emb = model.encode([text])[0]
    return np.array(emb)


def calculate_cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def extract_skills(text: str) -> List[str]:
    nlp = get_nlp()
    doc = nlp(text)
    candidates = set()
    for chunk in doc.noun_chunks:
        token = chunk.text.strip()
        if 2 <= len(token) <= 40:
            candidates.add(token)
    for token in doc:
        if token.pos_ in {"PROPN", "NOUN"} and token.is_alpha and len(token.text) > 2:
            candidates.add(token.text.strip())
    return sorted({c.lower() for c in candidates})


def calculate_skill_match_ratio(resume_skills: List[str], job_skills: List[str]) -> float:
    if not job_skills:
        return 0.0
    resume_set = {s.lower() for s in resume_skills}
    job_set = {s.lower() for s in job_skills}
    matched = resume_set.intersection(job_set)
    return len(matched) / len(job_set)


def cluster_skills(skills: List[str], n_clusters: int = 5) -> List[Dict]:
    unique_skills = sorted({s.lower() for s in skills})
    if not unique_skills:
        return []
    n_clusters = min(n_clusters, len(unique_skills))
    model = get_model()
    embeddings = model.encode(unique_skills)
    kmeans = KMeans(n_clusters=n_clusters, n_init=10)
    labels = kmeans.fit_predict(embeddings)

    clusters: Dict[int, List[str]] = {}
    for skill, label in zip(unique_skills, labels):
        clusters.setdefault(int(label), []).append(skill)

    result = []
    for idx, cluster_skills in clusters.items():
        name = ", ".join(cluster_skills[:3])
        result.append(
            {
                "cluster_id": idx,
                "cluster_name": name or f"Cluster {idx + 1}",
                "skills": cluster_skills,
            }
        )
    return result


def recommend_skills(matched_skills: List[str], missing_skills: List[str], top_k: int = 10) -> List[str]:
    if not matched_skills or not missing_skills:
        return []
    model = get_model()
    matched_emb = model.encode(matched_skills)
    missing_emb = model.encode(missing_skills)

    scores: List[Tuple[str, float]] = []
    for i, m_skill in enumerate(missing_skills):
        emb = missing_emb[i]
        sims = []
        for j in range(len(matched_skills)):
            sims.append(calculate_cosine_similarity(emb, matched_emb[j]))
        scores.append((m_skill, float(np.mean(sims)) if sims else 0.0))

    scores.sort(key=lambda x: x[1], reverse=True)
    return [s for s, _ in scores[:top_k]]

