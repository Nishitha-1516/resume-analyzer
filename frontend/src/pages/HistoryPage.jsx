import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, Eye, Loader2, AlertCircle, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { getHistory, getAnalysis, deleteAnalysis } from "../utils/api";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await getHistory(p, 8);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory]);

  const handleView = async (id) => {
    try {
      const analysis = await getAnalysis(id);
      sessionStorage.setItem("analysisResult", JSON.stringify(analysis));
      navigate("/results");
    } catch (err) {
      alert("Failed to load analysis: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this analysis? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteAnalysis(id);
      fetchHistory(page);
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const matchColor = (pct) =>
    pct >= 75 ? "text-acid" : pct >= 50 ? "text-sky-brand" : "text-coral";

  const gradeStyle = (grade) => ({
    Excellent: "bg-acid/10 text-acid border-acid/20",
    Good: "bg-sky-brand/10 text-sky-brand border-sky-brand/20",
    Fair: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    "Needs Work": "bg-coral/10 text-coral border-coral/20",
  }[grade] || "bg-ink-700 text-ink-400 border-ink-600");

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <p className="section-label mb-2">Analysis History</p>
        <h1 className="font-display text-4xl font-bold text-white">Past Analyses</h1>
        <p className="text-ink-400 mt-2">Review and compare your previous resume analyses.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-coral/10 border border-coral/20 rounded-xl">
          <AlertCircle size={18} className="text-coral mt-0.5 flex-shrink-0" />
          <p className="text-coral text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-acid animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && data?.analyses?.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-ink-700 flex items-center justify-center mx-auto mb-6">
            <Clock size={28} className="text-ink-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">No history yet</h2>
          <p className="text-ink-400 mb-8">Run your first analysis to see it here.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Start Analyzing
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && data?.analyses?.length > 0 && (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-800">
                    {["Resume", "Job Title", "Match", "ATS", "Date", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-4 section-label">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800">
                  {data.analyses.map((a) => (
                    <tr key={a._id} className="hover:bg-ink-800/40 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-ink-800 border border-ink-700 flex items-center justify-center flex-shrink-0">
                            <FileText size={14} className="text-ink-400" />
                          </div>
                          <span className="text-white text-sm font-medium truncate max-w-[140px]">
                            {a.resumeFileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-ink-300 text-sm max-w-[160px]">
                        <span className="truncate block">{a.jobTitle}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-display font-bold text-lg ${matchColor(a.matchPercentage)}`}>
                          {a.matchPercentage}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono border ${gradeStyle(a.atsGrade)}`}>
                          {a.atsGrade}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-ink-400 text-sm font-mono">
                        {formatDate(a.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleView(a._id)}
                            className="p-2 rounded-lg bg-acid/10 hover:bg-acid/20 text-acid transition-colors"
                            title="View analysis"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            disabled={deleting === a._id}
                            className="p-2 rounded-lg bg-coral/10 hover:bg-coral/20 text-coral transition-colors disabled:opacity-50"
                            title="Delete analysis"
                          >
                            {deleting === a._id
                              ? <Loader2 size={15} className="animate-spin" />
                              : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-ink-400 text-sm font-mono">
                Showing {(page - 1) * 8 + 1}–{Math.min(page * 8, data.pagination.total)} of{" "}
                {data.pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-secondary flex items-center gap-1 py-2 px-3 text-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  className="btn-secondary flex items-center gap-1 py-2 px-3 text-sm"
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
