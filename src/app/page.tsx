"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

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
      const { data, error } = await supabase.from('uploads').select('status,keywords,summary').eq('id', uploadId).single();
      if (error) return;
      if (data.status === 'done') {
        setResult({ keywords: data.keywords, summary: data.summary });
        setPolling(false);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [uploadId, polling]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Upload a Book Page Image</h1>
      <form onSubmit={handleUpload} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          type="submit"
          disabled={uploading || !file}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
      </form>
      {polling && <div className="mt-4 text-blue-600 text-sm">Processing... Please wait.</div>}
      {result && (
        <div className="mt-6 p-4 border rounded bg-white w-full max-w-md shadow text-gray-900">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div><strong>Keywords:</strong> {result.keywords || 'N/A'}</div>
          <div className="mt-2"><strong>Summary:</strong> {result.summary || 'N/A'}</div>
          {result.main_argument && (
            <div className="mt-2"><strong>Main Argument:</strong> {result.main_argument}</div>
          )}
        </div>
      )}
    </div>
  );
}
