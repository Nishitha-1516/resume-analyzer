/**
 * Resume Routes
 * POST /api/resume/upload  — upload PDF → extract text via ML service
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// Use memory storage — don't persist PDFs to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

/**
 * POST /api/resume/upload
 * Receives a PDF, forwards to ML service, returns extracted text
 */
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: "application/pdf",
    });

    const mlResponse = await axios.post(`${ML_URL}/extract-text`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    return res.json({
      filename: req.file.originalname,
      text: mlResponse.data.text,
      wordCount: mlResponse.data.word_count,
    });
  } catch (err) {
    console.error("Resume upload error:", err.message);

    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "ML service is not running. Please start the Python service on port 5001.",
      });
    }

    const status = err.response?.status || 500;
    const message = err.response?.data?.error || err.message;
    return res.status(status).json({ error: message });
  }
});

module.exports = router;
