/**
 * Analysis Schema
 * Stores each resume ↔ job description analysis result
 */

const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema(
  {
    // User-facing metadata
    resumeFileName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "Untitled Position",
    },

    // Raw texts (stored for re-analysis capability)
    resumeText: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },

    // Core scores
    matchPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    atsGrade: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Needs Work"],
      required: true,
    },

    // Skill breakdown
    matchingSkills: [String],
    missingSkills: [String],
    extraSkills: [String],
    resumeSkills: [String],
    jdSkills: [String],

    // Detailed metrics
    metrics: {
      textSimilarity: Number,
      skillMatchRatio: Number,
      keywordCoverage: Number,
    },

    // Recommendations
    recommendations: [String],

    // Stats
    stats: {
      resumeWordCount: Number,
      jdWordCount: Number,
      resumeSkillCount: Number,
      jdSkillCount: Number,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
  }
);

// Index for efficient history queries
AnalysisSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Analysis", AnalysisSchema);
