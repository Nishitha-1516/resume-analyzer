"""
Resume ↔ Job Description Matcher
Computes:
  - Cosine similarity score (TF-IDF)
  - Skill-based match percentage
  - Missing skills
  - Top matching skills
  - ATS score
"""

import math
import re
import logging
from collections import Counter
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


# ── Text utilities ─────────────────────────────────────────────────────────────

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "this", "that", "these", "those",
    "i", "you", "he", "she", "we", "they", "it", "my", "your", "our",
    "their", "its", "as", "not", "no", "so", "if", "then", "than", "more",
    "also", "can", "any", "all", "some", "such", "other", "new", "up",
    "out", "about", "into", "through", "over", "after", "before", "between",
    "how", "what", "when", "where", "who", "which", "while", "both", "each",
}


def tokenize(text: str) -> List[str]:
    text = text.lower()
    tokens = re.findall(r"\b[a-z][a-z0-9\.\+\#\-]{1,}\b", text)
    return [t for t in tokens if t not in STOPWORDS and len(t) > 1]


def tf(tokens: List[str]) -> Dict[str, float]:
    count = Counter(tokens)
    total = len(tokens) or 1
    return {word: freq / total for word, freq in count.items()}


def cosine_similarity(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
    common_keys = set(vec_a) & set(vec_b)
    if not common_keys:
        return 0.0
    dot = sum(vec_a[k] * vec_b[k] for k in common_keys)
    mag_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
    mag_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


# ── Core matching logic ────────────────────────────────────────────────────────

def compute_match(
    resume_text: str,
    jd_text: str,
    resume_skills: List[str],
    jd_skills: List[str],
) -> Dict[str, Any]:
    """
    Returns a comprehensive match report dict.
    """

    # 1. TF-IDF cosine similarity (text-level)
    resume_tokens = tokenize(resume_text)
    jd_tokens = tokenize(jd_text)
    resume_tf = tf(resume_tokens)
    jd_tf = tf(jd_tokens)
    text_similarity = cosine_similarity(resume_tf, jd_tf)

    # 2. Skill-level match
    resume_skill_set = set(s.lower() for s in resume_skills)
    jd_skill_set = set(s.lower() for s in jd_skills)

    matching_skills = sorted(resume_skill_set & jd_skill_set)
    missing_skills = sorted(jd_skill_set - resume_skill_set)
    extra_skills = sorted(resume_skill_set - jd_skill_set)  # bonus resume skills

    skill_match_ratio = (
        len(matching_skills) / len(jd_skill_set) if jd_skill_set else 0.0
    )

    # 3. Keyword coverage — how many JD keywords appear in resume?
    jd_keywords = set(jd_tokens)
    resume_words = set(resume_tokens)
    keyword_coverage = (
        len(jd_keywords & resume_words) / len(jd_keywords) if jd_keywords else 0.0
    )

    # 4. Composite match percentage
    # Weighted: 40% text similarity, 40% skill match, 20% keyword coverage
    raw_score = (
        0.40 * text_similarity
        + 0.40 * skill_match_ratio
        + 0.20 * keyword_coverage
    )
    match_percentage = round(min(raw_score * 100, 100), 1)

    # 5. ATS score — simulates an Applicant Tracking System
    # Based on: skill density, keyword coverage, formatting signals
    ats_raw = (
        0.50 * skill_match_ratio
        + 0.30 * keyword_coverage
        + 0.20 * text_similarity
    )
    ats_score = round(min(ats_raw * 100, 100), 1)

    # 6. Grade helper
    def grade(score: float) -> str:
        if score >= 80:
            return "Excellent"
        if score >= 60:
            return "Good"
        if score >= 40:
            return "Fair"
        return "Needs Work"

    # 7. Top matching skills (up to 10)
    top_matching = matching_skills[:10]

    # 8. Recommendations
    recommendations = _build_recommendations(
        match_percentage, missing_skills, keyword_coverage, ats_score
    )

    return {
        "match_percentage": match_percentage,
        "ats_score": ats_score,
        "ats_grade": grade(ats_score),
        "text_similarity": round(text_similarity * 100, 1),
        "skill_match_ratio": round(skill_match_ratio * 100, 1),
        "keyword_coverage": round(keyword_coverage * 100, 1),
        "matching_skills": matching_skills,
        "top_matching_skills": top_matching,
        "missing_skills": missing_skills,
        "extra_skills": extra_skills,
        "resume_skills": sorted(resume_skill_set),
        "jd_skills": sorted(jd_skill_set),
        "recommendations": recommendations,
        "stats": {
            "resume_word_count": len(resume_tokens),
            "jd_word_count": len(jd_tokens),
            "resume_skill_count": len(resume_skill_set),
            "jd_skill_count": len(jd_skill_set),
        },
    }


def _build_recommendations(
    match_pct: float,
    missing_skills: List[str],
    keyword_coverage: float,
    ats_score: float,
) -> List[str]:
    recs = []

    if match_pct < 50:
        recs.append(
            "Your resume has a low match with this job. Tailor your resume more specifically to this role."
        )

    if missing_skills:
        top_missing = missing_skills[:5]
        recs.append(
            f"Add these key skills if you have experience: {', '.join(top_missing)}."
        )

    if keyword_coverage < 0.4:
        recs.append(
            "Use more keywords from the job description naturally throughout your resume."
        )

    if ats_score < 60:
        recs.append(
            "Your ATS score is low. Use standard section headings like 'Experience', 'Skills', and 'Education'."
        )

    if match_pct >= 75:
        recs.append(
            "Great match! Focus on quantifying your achievements (numbers, percentages, impact)."
        )

    if not recs:
        recs.append("Review the missing skills section and add any relevant experience.")

    return recs
