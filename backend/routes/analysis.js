/**
 * Analysis Routes
 *
 * POST   /api/analysis/analyze          — run analysis, save to DB
 * GET    /api/analysis/history          — paginated history list
 * GET    /api/analysis/:id              — single analysis by ID
 * DELETE /api/analysis/:id              — delete an analysis
 */

const express = require("express");
const router = express.Router();
const axios = require("axios");
const Analysis = require("../models/Analysis");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// ── POST /analyze ─────────────────────────────────────────────────────────────
router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jobDescription, resumeFileName, jobTitle } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: "Both resumeText and jobDescription are required",
      });
    }

    // Call ML service
    const mlResponse = await axios.post(
      `${ML_URL}/analyze`,
      { resume_text: resumeText, job_description: jobDescription },
      { timeout: 60000 }
    );

    const ml = mlResponse.data;

    // Persist to MongoDB
    const analysis = await Analysis.create({
      resumeFileName: resumeFileName || "resume.pdf",
      jobTitle: jobTitle || "Untitled Position",
      resumeText,
      jobDescription,
      matchPercentage: ml.match_percentage,
      atsScore: ml.ats_score,
      atsGrade: ml.ats_grade,
      matchingSkills: ml.matching_skills || [],
      missingSkills: ml.missing_skills || [],
      extraSkills: ml.extra_skills || [],
      resumeSkills: ml.resume_skills || [],
      jdSkills: ml.jd_skills || [],
      metrics: {
        textSimilarity: ml.text_similarity,
        skillMatchRatio: ml.skill_match_ratio,
        keywordCoverage: ml.keyword_coverage,
      },
      recommendations: ml.recommendations || [],
      stats: {
        resumeWordCount: ml.stats?.resume_word_count,
        jdWordCount: ml.stats?.jd_word_count,
        resumeSkillCount: ml.stats?.resume_skill_count,
        jdSkillCount: ml.stats?.jd_skill_count,
      },
    });

    return res.status(201).json({
      message: "Analysis complete",
      analysisId: analysis._id,
      analysis,
    });
  } catch (err) {
    console.error("Analysis error:", err.message);

    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "ML service is not running. Please start the Python service.",
      });
    }

    const status = err.response?.status || 500;
    const message = err.response?.data?.error || err.message;
    return res.status(status).json({ error: message });
  }
});

// ── GET /history ──────────────────────────────────────────────────────────────
router.get("/history", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      Analysis.find({})
        .select(
          "resumeFileName jobTitle matchPercentage atsScore atsGrade createdAt stats"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Analysis.countDocuments(),
    ]);

    return res.json({
      analyses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("History error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /:id ──────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).lean();
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    return res.json(analysis);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid analysis ID" });
    }
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    return res.json({ message: "Analysis deleted", id: req.params.id });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid analysis ID" });
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
