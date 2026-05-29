import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 90000,
});

// ── Resume ────────────────────────────────────────────────────────────────────

/**
 * Upload a PDF file and get extracted text back
 * @param {File} file
 * @param {function} onProgress  (0-100)
 */
export async function uploadResume(file, onProgress) {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return response.data; // { filename, text, wordCount }
}

// ── Analysis ──────────────────────────────────────────────────────────────────

/**
 * Run analysis on resume text vs job description
 */
export async function runAnalysis({ resumeText, jobDescription, resumeFileName, jobTitle }) {
  const response = await api.post("/analysis/analyze", {
    resumeText,
    jobDescription,
    resumeFileName,
    jobTitle,
  });
  return response.data; // { analysisId, analysis }
}

/**
 * Get paginated history
 */
export async function getHistory(page = 1, limit = 10) {
  const response = await api.get("/analysis/history", { params: { page, limit } });
  return response.data; // { analyses, pagination }
}

/**
 * Get a single analysis by ID
 */
export async function getAnalysis(id) {
  const response = await api.get(`/analysis/${id}`);
  return response.data;
}

/**
 * Delete an analysis
 */
export async function deleteAnalysis(id) {
  const response = await api.delete(`/analysis/${id}`);
  return response.data;
}
