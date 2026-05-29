import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { uploadResume } from "../utils/api";

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState(null); // { text, wordCount, filename }

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      return;
    }
    setError("");
    setFile(f);
    setExtracted(null);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = (e) => handleFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const data = await uploadResume(file, setProgress);
      setExtracted({ text: data.text, wordCount: data.wordCount, filename: data.filename });

      // Store in sessionStorage for next page
      sessionStorage.setItem(
        "resumeData",
        JSON.stringify({ text: data.text, filename: data.filename })
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setExtracted(null);
    setError("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Page header */}
      <div>
        <p className="section-label mb-2">Step 1 of 2</p>
        <h1 className="font-display text-4xl font-bold text-white">
          Upload your resume
        </h1>
        <p className="text-ink-400 mt-2 text-lg">
          Drop your PDF and we'll extract the text for analysis.
        </p>
      </div>

      {/* Drop zone */}
      {!extracted && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
            ${dragging
              ? "border-acid bg-acid/5 scale-[1.01]"
              : file
              ? "border-ink-600 bg-ink-900"
              : "border-ink-700 bg-ink-900 hover:border-ink-500 hover:bg-ink-800/50"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onInputChange}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center">
                <FileText size={28} className="text-acid" />
              </div>
              <div>
                <p className="font-display font-semibold text-white text-lg">{file.name}</p>
                <p className="text-ink-400 text-sm mt-1">
                  {(file.size / 1024).toFixed(1)} KB · PDF
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-ink-700 flex items-center justify-center">
                <Upload size={28} className="text-ink-400" />
              </div>
              <div>
                <p className="font-display font-semibold text-white text-lg">
                  Drop your PDF here
                </p>
                <p className="text-ink-400 text-sm mt-1">or click to browse · Max 10 MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-400 font-mono">Extracting text...</span>
            <span className="text-acid font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-acid rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-coral/10 border border-coral/20 rounded-xl">
          <AlertCircle size={18} className="text-coral mt-0.5 flex-shrink-0" />
          <p className="text-coral text-sm">{error}</p>
        </div>
      )}

      {/* Success / extracted preview */}
      {extracted && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-acid" />
            <div>
              <p className="font-display font-semibold text-white">Text extracted successfully</p>
              <p className="text-ink-400 text-sm">{extracted.wordCount} words detected</p>
            </div>
          </div>

          <div className="bg-ink-800 rounded-xl p-4 max-h-40 overflow-y-auto">
            <p className="text-ink-300 text-sm font-mono leading-relaxed whitespace-pre-wrap">
              {extracted.text.slice(0, 600)}
              {extracted.text.length > 600 && (
                <span className="text-ink-500"> … (truncated preview)</span>
              )}
            </p>
          </div>

          <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => navigate("/job")}>
            Continue to Job Description →
          </button>
        </div>
      )}

      {/* Upload button */}
      {!extracted && (
        <button
          className="btn-primary w-full flex items-center justify-center gap-2"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Upload size={18} />
              Extract Text
            </>
          )}
        </button>
      )}
    </div>
  );
}
