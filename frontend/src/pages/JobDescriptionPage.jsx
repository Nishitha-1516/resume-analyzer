import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { runAnalysis } from "../utils/api";

const SAMPLE_JD = `We are looking for a Senior Software Engineer with experience in:

• 4+ years of Python and JavaScript/TypeScript development
• Strong experience with React.js and Node.js
• Proficiency in RESTful API design and GraphQL
• Experience with MongoDB, PostgreSQL, or similar databases
• Familiarity with AWS or GCP cloud services
• Knowledge of Docker and CI/CD pipelines
• Experience with machine learning frameworks (TensorFlow, PyTorch) is a plus
• Strong communication and collaboration skills
• Agile/Scrum methodology experience

Responsibilities:
- Design and develop scalable backend services
- Build responsive React frontends
- Collaborate with data science teams on ML integrations
- Conduct code reviews and mentor junior developers`;

export default function JobDescriptionPage() {
  const navigate = useNavigate();

  const [resumeData, setResumeData] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("resumeData");
    if (stored) {
      setResumeData(JSON.parse(stored));
    }
  }, []);

  const handleAnalyze = async () => {
    if (!resumeData?.text) {
      setError("Resume text not found. Please go back and upload your resume.");
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      setError("Please enter a job description (at least 50 characters).");
      return;
    }

    setError("");
    setAnalyzing(true);

    try {
      const result = await runAnalysis({
        resumeText: resumeData.text,
        jobDescription: jobDescription.trim(),
        resumeFileName: resumeData.filename || "resume.pdf",
        jobTitle: jobTitle.trim() || "Untitled Position",
      });

      sessionStorage.setItem("analysisResult", JSON.stringify(result.analysis));
      navigate("/results");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const charCount = jobDescription.length;
  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-ink-400 hover:text-white transition-colors text-sm font-mono"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <p className="section-label mb-2">Step 2 of 2</p>
        <h1 className="font-display text-4xl font-bold text-white">
          Paste the job description
        </h1>
        <p className="text-ink-400 mt-2 text-lg">
          We'll compare it against your resume to find matches and gaps.
        </p>
      </div>

      {/* Resume context badge */}
      {resumeData && (
        <div className="flex items-center gap-3 px-4 py-3 bg-acid/5 border border-acid/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-acid animate-pulse" />
          <p className="text-acid text-sm font-mono">
            Resume loaded: <span className="font-medium">{resumeData.filename}</span>
          </p>
        </div>
      )}

      {!resumeData && (
        <div className="flex items-start gap-3 p-4 bg-coral/10 border border-coral/20 rounded-xl">
          <AlertCircle size={18} className="text-coral mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-coral text-sm font-medium">No resume found</p>
            <p className="text-coral/70 text-sm">Please upload your resume first.</p>
          </div>
        </div>
      )}

      {/* Job title */}
      <div className="space-y-2">
        <label className="section-label">Job title (optional)</label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          className="input-field"
        />
      </div>

      {/* JD textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="section-label">Job description *</label>
          <span className="text-xs font-mono text-ink-500">
            {wordCount} words · {charCount} chars
          </span>
        </div>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here…"
          rows={14}
          className="input-field resize-none leading-relaxed"
        />
        <button
          onClick={() => setJobDescription(SAMPLE_JD)}
          className="text-xs font-mono text-ink-500 hover:text-acid transition-colors"
        >
          ↗ Load sample job description
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-coral/10 border border-coral/20 rounded-xl">
          <AlertCircle size={18} className="text-coral mt-0.5 flex-shrink-0" />
          <p className="text-coral text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        className="btn-primary w-full flex items-center justify-center gap-2"
        onClick={handleAnalyze}
        disabled={analyzing || !jobDescription.trim()}
      >
        {analyzing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analyzing with AI…
          </>
        ) : (
          <>
            <Briefcase size={18} />
            Analyze Match
          </>
        )}
      </button>
    </div>
  );
}
