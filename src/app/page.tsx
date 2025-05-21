"use client";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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
    const { error: dbError } = await supabase.from('uploads').insert([
      {
        image_url: data?.path,
        status: 'pending',
      },
    ]);
    if (dbError) {
      setError(dbError.message);
      setUploading(false);
      return;
    }
    setSuccess("Upload successful! Processing will start soon.");
    setUploading(false);
    setFile(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center w-full max-w-xs">
        <h1 className="text-2xl font-bold mb-4">Upload a Book Page Image</h1>
        <form onSubmit={handleUpload} className="flex flex-col gap-4 w-full">
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
        <div className="mt-4 text-gray-700 text-sm text-center">Results will appear here after processing.</div>
      </main>
    </div>
  );
}
