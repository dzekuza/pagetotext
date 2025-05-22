"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Image from "next/image";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);
  const [result, setResult] = useState<{ keywords: string | null; summary: string | null; main_argument?: string | null } | null>(null);
  const [polling, setPolling] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
    setSuccess(null);
    setResult(null);
    setUploadId(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);
    setUploadId(null);
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    // Insert DB record for n8n automation
    const { data: insertData, error: dbError } = await supabase.from('uploads').insert([
      {
        image_url: data?.path,
        status: 'pending',
      },
    ]).select('id');
    if (dbError) {
      setError(dbError.message);
      setUploading(false);
      return;
    }
    const newId = insertData?.[0]?.id;
    setUploadId(newId);

    // Trigger n8n webhook
    await fetch("https://n8n.srv824584.hstgr.cloud/webhook/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId: newId })
    });

    setSuccess("Upload successful! Processing will start soon.");
    setUploading(false);
    setFile(null);
    setPolling(true);
  };

  // Poll for results
  useEffect(() => {
    if (!uploadId || !polling) return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase.from('uploads').select('status,keywords,summary,main_argument').eq('id', uploadId).single();
      if (error) return;
      if (data.status === 'done') {
        setResult({ keywords: data.keywords, summary: data.summary, main_argument: data.main_argument });
        setPolling(false);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [uploadId, polling]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Upload a Book Page Image</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl items-start">
        {/* Upload Area */}
        <form
          onSubmit={handleUpload}
          className="flex flex-col gap-4 w-full max-w-xs mx-auto"
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              setFile(e.dataTransfer.files[0]);
              setError(null);
              setSuccess(null);
              setResult(null);
              setUploadId(null);
            }
          }}
        >
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 transition-colors bg-white mb-2"
          >
            <Image
              src="/imagess/A_2D_digital_vector_icon_features_a_lavender-color%20Background%20Removed.png"
              alt="Upload icon"
              width={96}
              height={96}
              className="mb-2"
            />
            <span className="text-blue-700 font-semibold">Click to Upload</span>
            <span className="text-gray-500">or drag and drop</span>
            <span className="text-xs text-gray-400 mt-1">(Images or PDFs, max 25 MB)</span>
            <input
              id="file-upload"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          {polling && <div className="mt-4 text-blue-600 text-sm">Processing... Please wait.</div>}
        </form>
        {/* Results Area */}
        <div className="w-full max-w-xl mx-auto">
          {result && (
            <div className="p-6 rounded-lg shadow" style={{ background: '#141414', color: '#878787' }}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#878787' }}>Results</h2>
              <div><strong>Keywords:</strong> {result.keywords || 'N/A'}</div>
              <div className="mt-2"><strong>Summary:</strong> {result.summary || 'N/A'}</div>
              {result.main_argument && (
                <div className="mt-2"><strong>Main Argument:</strong> {result.main_argument}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
