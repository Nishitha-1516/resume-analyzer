"""
Skill Extractor
Extracts technical and soft skills from text using keyword matching
and optional spaCy NLP for noun phrase extraction.
"""

import re
import logging
from typing import List, Set

logger = logging.getLogger(__name__)

# ── Comprehensive skill taxonomy ──────────────────────────────────────────────
SKILL_TAXONOMY = {
    "programming_languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
        "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
        "bash", "shell", "powershell", "sql", "plsql", "dart", "lua", "elixir",
        "haskell", "clojure", "groovy", "assembly",
    ],
    "web_frontend": [
        "react", "react.js", "reactjs", "vue", "vue.js", "angular", "next.js",
        "nuxt.js", "svelte", "html", "css", "sass", "scss", "tailwind",
        "bootstrap", "jquery", "webpack", "vite", "redux", "zustand",
        "graphql", "rest api", "restful",
    ],
    "web_backend": [
        "node.js", "nodejs", "express", "express.js", "django", "flask",
        "fastapi", "spring", "spring boot", "rails", "ruby on rails",
        "asp.net", "laravel", "nestjs", "koa", "gin", "fiber",
    ],
    "databases": [
        "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
        "oracle", "sql server", "cassandra", "dynamodb", "firestore",
        "elasticsearch", "neo4j", "supabase",
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
        "terraform", "ansible", "jenkins", "github actions", "ci/cd",
        "linux", "nginx", "apache", "helm", "prometheus", "grafana",
    ],
    "data_ml": [
        "machine learning", "deep learning", "nlp", "natural language processing",
        "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
        "pandas", "numpy", "scipy", "matplotlib", "seaborn", "spark",
        "hadoop", "airflow", "dbt", "tableau", "power bi", "data analysis",
        "data science", "data engineering", "statistics", "a/b testing",
        "llm", "generative ai", "transformers", "bert", "gpt",
    ],
    "mobile": [
        "android", "ios", "react native", "flutter", "xamarin", "ionic",
        "objective-c", "swiftui",
    ],
    "tools_practices": [
        "git", "github", "gitlab", "bitbucket", "jira", "confluence",
        "agile", "scrum", "kanban", "tdd", "bdd", "unit testing",
        "microservices", "api design", "system design", "design patterns",
        "object oriented programming", "oop", "functional programming",
        "code review", "pair programming",
    ],
    "soft_skills": [
        "communication", "teamwork", "leadership", "problem solving",
        "critical thinking", "time management", "adaptability", "creativity",
        "collaboration", "mentoring", "project management",
    ],
}

# Flat lookup set for fast membership test
ALL_SKILLS: Set[str] = set()
for category_skills in SKILL_TAXONOMY.values():
    ALL_SKILLS.update(category_skills)


def normalize(text: str) -> str:
    return text.lower().strip()


def extract_skills(text: str) -> List[str]:
    """
    Return a deduplicated list of skills found in the text.
    Uses multi-word phrase matching so 'machine learning' is caught before 'learning'.
    """
    text_lower = normalize(text)
    # Remove punctuation except hyphens/dots that appear in skill names
    text_clean = re.sub(r"[^\w\s\.\-/+#]", " ", text_lower)

    found: Set[str] = set()

    # Sort by length descending so longer phrases match first
    sorted_skills = sorted(ALL_SKILLS, key=lambda s: len(s), reverse=True)

    for skill in sorted_skills:
        # Word-boundary aware search
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_clean):
            found.add(skill)

    # Optionally enrich with spaCy noun chunks
    try:
        found.update(_extract_with_spacy(text))
    except Exception:
        pass

    return sorted(found)


def _extract_with_spacy(text: str) -> Set[str]:
    """Best-effort spaCy extraction — returns empty set if spaCy unavailable."""
    import spacy  # noqa: F401

    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        return set()

    doc = nlp(text[:50000])  # cap to avoid OOM on huge texts
    extra: Set[str] = set()
    for chunk in doc.noun_chunks:
        normalized = normalize(chunk.text)
        if normalized in ALL_SKILLS:
            extra.add(normalized)
    return extra


def get_skill_category(skill: str) -> str:
    """Return the taxonomy category for a given skill."""
    skill_lower = normalize(skill)
    for category, skills in SKILL_TAXONOMY.items():
        if skill_lower in skills:
            return category
    return "other"
