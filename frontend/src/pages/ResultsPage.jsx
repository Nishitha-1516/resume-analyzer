import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, XCircle, TrendingUp, AlertTriangle,
  ArrowLeft, RotateCcw, Award, Target, Zap, BookOpen
} from "lucide-react";

export default function ResultsPage() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setAnalysis(JSON.parse(stored));
    }
  }, []);

  if (!analysis) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-ink-700 flex items-center justify-center mx-auto mb-6">
          <Target size={28} className="text-ink-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">No results yet</h2>
        <p className="text-ink-400 mb-8">Upload your resume and add a job description to see the analysis.</p>
        <button className="btn-primary" onClick={() => navigate("/")}>
          Start Analysis
        </button>
      </div>
    );
  }

  const matchPct = analysis.matchPercentage;
  const atsScore = analysis.atsScore;

  const matchColor = matchPct >= 75 ? "#a3ff47" : matchPct >= 50 ? "#47c5ff" : "#ff6b6b";
  const matchLabel = matchPct >= 75 ? "Strong Match" : matchPct >= 50 ? "Moderate Match" : "Weak Match";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate("/job")}
            className="flex items-center gap-2 text-ink-400 hover:text-white transition-colors text-sm font-mono mb-4"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <p className="section-label mb-2">Analysis Results</p>
          <h1 className="font-display text-4xl font-bold text-white">
            {analysis.jobTitle || "Resume Match Report"}
          </h1>
          <p className="text-ink-400 mt-1 text-sm font-mono">
            {analysis.resumeFileName} · {new Date(analysis.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          className="btn-secondary flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <RotateCcw size={16} />
          New Analysis
        </button>
      </div>

      {/* Score hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Match % */}
        <div className="card p-6 md:col-span-1 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: `radial-gradient(circle at 30% 50%, ${matchColor}, transparent 70%)` }}
          />
          <p className="section-label mb-4">Overall Match</p>
          <div className="flex items-end gap-3">
            <span className="font-display text-6xl font-bold" style={{ color: matchColor }}>
              {matchPct}
            </span>
            <span className="font-display text-2xl text-ink-400 mb-2">%</span>
          </div>
          <p className="text-sm font-mono mt-2" style={{ color: matchColor }}>{matchLabel}</p>
          <RadialProgress value={matchPct} color={matchColor} className="mt-4" />
        </div>

        {/* ATS Score */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-sky-brand to-transparent" />
          <p className="section-label mb-2">ATS Score</p>
          <div className="flex items-end gap-2">
            <span className="font-display text-5xl font-bold text-sky-brand">{atsScore}</span>
            <span className="font-display text-xl text-ink-400 mb-1">/100</span>
          </div>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-mono font-medium
            ${analysis.atsGrade === "Excellent" ? "bg-acid/10 text-acid border border-acid/20"
            : analysis.atsGrade === "Good" ? "bg-sky-brand/10 text-sky-brand border border-sky-brand/20"
            : analysis.atsGrade === "Fair" ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
            : "bg-coral/10 text-coral border border-coral/20"}`}>
            {analysis.atsGrade}
          </span>
          <p className="text-ink-400 text-xs mt-3 leading-relaxed">
            Applicant Tracking System compatibility score
          </p>
        </div>

        {/* Metrics breakdown */}
        <div className="card p-6">
          <p className="section-label mb-4">Breakdown</p>
          <div className="space-y-3">
            <MetricBar label="Text Similarity" value={analysis.metrics?.textSimilarity || 0} color="#a3ff47" />
            <MetricBar label="Skill Match" value={analysis.metrics?.skillMatchRatio || 0} color="#47c5ff" />
            <MetricBar label="Keyword Coverage" value={analysis.metrics?.keywordCoverage || 0} color="#ff6b6b" />
          </div>
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matching skills */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-acid" />
            <p className="font-display font-semibold text-white">
              Matching Skills
              <span className="ml-2 text-acid text-sm">({analysis.matchingSkills?.length || 0})</span>
            </p>
          </div>
          {analysis.matchingSkills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.matchingSkills.map((skill) => (
                <span key={skill} className="skill-tag bg-acid/10 text-acid border border-acid/20">
                  ✓ {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-ink-500 text-sm">No matching skills found</p>
          )}
        </div>

        {/* Missing skills */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={18} className="text-coral" />
            <p className="font-display font-semibold text-white">
              Missing Skills
              <span className="ml-2 text-coral text-sm">({analysis.missingSkills?.length || 0})</span>
            </p>
          </div>
          {analysis.missingSkills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill) => (
                <span key={skill} className="skill-tag bg-coral/10 text-coral border border-coral/20">
                  ✗ {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-acid text-sm font-mono">You have all required skills! 🎉</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Resume Skills", value: analysis.stats?.resumeSkillCount || 0, icon: Award },
          { label: "JD Skills Required", value: analysis.stats?.jdSkillCount || 0, icon: Target },
          { label: "Resume Words", value: analysis.stats?.resumeWordCount || 0, icon: BookOpen },
          { label: "JD Words", value: analysis.stats?.jdWordCount || 0, icon: Zap },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <Icon size={16} className="text-ink-500 mb-2" />
            <p className="font-display text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-ink-400 text-xs font-mono mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-sky-brand" />
            <p className="font-display font-semibold text-white">AI Recommendations</p>
          </div>
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-sky-brand/10 border border-sky-brand/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-brand text-xs font-mono">{i + 1}</span>
                </span>
                <p className="text-ink-200 text-sm leading-relaxed">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extra skills in resume */}
      {analysis.extraSkills?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-400" />
            <p className="font-display font-semibold text-white text-sm">
              Skills in your resume not mentioned in JD ({analysis.extraSkills.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.extraSkills.map((skill) => (
              <span key={skill} className="skill-tag bg-yellow-400/5 text-yellow-400/80 border border-yellow-400/15 text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetricBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-ink-400">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function RadialProgress({ value, color }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (value / 100) * circumference;

  return (
    <svg width="72" height="72" className="mt-2" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="36" cy="36" r={radius} fill="none" stroke="#1a1a28" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={radius} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={`${strokeDash} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
}
