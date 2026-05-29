"""
ML Service - Resume Analyzer
Flask API that handles NLP tasks for resume analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

from utils.pdf_extractor import extract_text_from_pdf
from utils.skill_extractor import extract_skills
from utils.matcher import compute_match

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ml-service"})


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Accepts:
      - resume_text (string) OR resume_file (PDF bytes as base64)
      - job_description (string)
    Returns analysis JSON
    """
    try:
        data = request.get_json(force=True)

        resume_text = data.get("resume_text", "")
        job_description = data.get("job_description", "")

        if not resume_text:
            return jsonify({"error": "resume_text is required"}), 400
        if not job_description:
            return jsonify({"error": "job_description is required"}), 400

        # Extract skills from both texts
        resume_skills = extract_skills(resume_text)
        jd_skills = extract_skills(job_description)

        # Compute similarity and ATS score
        result = compute_match(resume_text, job_description, resume_skills, jd_skills)

        logger.info(f"Analysis complete. Match: {result['match_percentage']}%")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/extract-text", methods=["POST"])
def extract_text():
    """
    Accepts a PDF file upload and returns extracted text
    """
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        pdf_bytes = file.read()
        text = extract_text_from_pdf(pdf_bytes)

        if not text.strip():
            return jsonify({"error": "Could not extract text from PDF"}), 422

        return jsonify({"text": text, "word_count": len(text.split())})

    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
