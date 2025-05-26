"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Button from '../../../components/Button';

interface UploadComponentProps {
  standalone?: boolean;
}

export type FileStatus = "uploading" | "uploaded" | "error";

export interface UploadFile {
  id: string;
  file: File | null;
  name: string;
  size: number;
  progress: number;
  status: FileStatus;
  type: string;
  url?: string;
}

export default function UploadComponent({ standalone = true }: UploadComponentProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [url, setUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [continueAnyway, setContinueAnyway] = useState(false);
  const router = useRouter();
  const { publicKey } = useWallet();

  const handleFileSelect = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading" as FileStatus,
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((uploadFile) => simulateFileUpload(uploadFile.id));
  };

  const handleUrlUpload = () => {
    if (!url) return;
    const newFile: UploadFile = {
      id: crypto.randomUUID(),
      file: null,
      name: url.split("/").pop() || "File from URL",
      size: 0,
      progress: 0,
      status: "uploading",
      type: "application/octet-stream",
      url,
    };
    setFiles((prev) => [...prev, newFile]);
    simulateFileUpload(newFile.id);
    setUrl("");
  };

  const simulateFileUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? { ...file, progress: 100, status: "uploaded" }
              : file
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === fileId ? { ...file, progress } : file
          )
        );
      }
    }, 500);
  };

  const handleCancel = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(Array.from(e.dataTransfer.files));
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUploadId(null);
    if (files.length === 0) {
      setError("Please select a file.");
      return;
    }
    if (!files[0].file) {
      setError("Selected file is invalid.");
      return;
    }
    if (!publicKey && !continueAnyway) {
      setShowProgressModal(true);
      return;
    }
    setUploading(true);
    const fileExt = files[0].file?.name.split('.')?.pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, files[0].file);
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
        wallet: publicKey?.toBase58() || "",
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
    setFiles([]);
    setPolling(true);
  };

  // Poll for results and redirect
  useEffect(() => {
    if (!uploadId || !polling) return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase.from('uploads').select('status').eq('id', uploadId).single();
      if (error) return;
      if (data.status === 'done') {
        setPolling(false);
        clearInterval(interval);
        router.push(`/result/${uploadId}`);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [uploadId, polling, router]);

  const containerClass = standalone
    ? "flex flex-col items-center justify-center min-h-screen p-4 bg-[#111]"
    : "w-full";

  return (
    <div className={containerClass}>
      {standalone && (
        <h1 className="text-2xl font-bold mb-6 text-white">Upload a Book Page Image</h1>
      )}
      <div className="relative z-0 w-full max-w-md mx-auto pb-8">
        <div className="w-full max-w-md mx-auto bg-[#181818] rounded-2xl shadow-lg border border-[#222] text-white px-6 py-8">
        <div className="pb-4 text-center">
          <div className="text-2xl font-bold text-white">Upload Files</div>
        </div>
        <div className="px-0">
          <label
            className={
              `block border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ` +
              (dragActive ? "bg-[#232323] border-green-400" : "bg-[#161616] border-[#333]")
            }
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 rounded-full bg-[#232323] flex items-center justify-center">
                <Image src="/imagess/UPLOAD FILE.png" alt="Upload file icon" width={48} height={48} className="h-12 w-12 object-contain" />
              </div>
              <div className="text-lg font-semibold text-green-300">Choose a file or drag & drop it here</div>
              <div className="text-xs text-gray-400">JPEG, PNG, and PDF formats, up to 10MB</div>
              <input type="file" multiple className="hidden" onChange={handleInputChange} />
              <Button
                onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}
              >
                Browse
              </Button>
            </div>
          </label>
          <div className="text-center text-sm text-gray-500 my-4">or</div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Paste file URL here"
              className="flex-1 rounded-lg px-4 py-2 border border-[#333] bg-[#232323] text-white focus:border-green-400 outline-none"
            />
            <Button
              onClick={handleUrlUpload}
            >
              Upload
            </Button>
          </div>
          {files.length > 0 && (
            <div className="space-y-2 mb-4">
              {files.map(file => (
                <div key={file.id} className="flex items-center bg-[#232323] rounded-lg px-4 py-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white truncate max-w-[260px]" title={file.name}>{file.name}</div>
                    <div className="text-xs text-gray-400">{file.size ? `${(file.size / 1024).toFixed(0)} KB` : "URL"} • {file.status === "uploading" ? "Uploading..." : file.status === "uploaded" ? "Uploaded" : "Error"}</div>
                    <div className="w-full bg-[#333] rounded h-1 mt-1">
                      <div
                        className={
                          file.status === "uploaded"
                            ? "bg-green-400"
                            : file.status === "error"
                            ? "bg-red-400"
                            : "bg-green-300 animate-pulse"
                        }
                        style={{ width: `${file.progress}%`, height: "100%" }}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCancel(file.id)}
                    className="ml-4 text-gray-400 hover:text-red-400"
                    title="Remove"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={handleUpload}>
          <div className="flex justify-between space-x-2 px-0">
            <Button
              type="submit"
              disabled={uploading || !files.some(file => file.status === "uploaded")}
              fullWidth
            >
              {success ? success : uploading && !polling ? "Analysing your upload" : polling ? "Processing... Please wait." : "Analyze"}
            </Button>
          </div>
        </form>
        {error && (
          <div className="bg-red-500 bg-opacity-20 text-white text-sm rounded-lg px-4 py-3 font-semibold border border-red-400 mt-4">
            {error}
          </div>
        )}
        </div>
      </div>
      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-opacity-70 backdrop-blur-sm">
          <div className="rounded-2xl bg-[#181818] p-8 w-[95vw] max-w-[420px] flex flex-col shadow-lg relative">
            <button
              className="absolute top-4 right-5 text-gray-400 hover:text-green-300 text-2xl font-bold"
              onClick={() => setShowProgressModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-green-300 mb-4">Don&apos;t lose your progress</h2>
            <div className="text-white text-base mb-6">Connect your wallet in order to get access to your analysis history.</div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setShowProgressModal(false);
                  // Open wallet connect modal
                  const walletBtn = document.querySelector('button, [role="button"]');
                  if (walletBtn) (walletBtn as HTMLElement).click();
                }}
              >
                Connect wallet
              </Button>
              <Button
                onClick={() => {
                  setShowProgressModal(false);
                  setContinueAnyway(true);
                  setTimeout(() => {
                    // Trigger the upload again, now with continueAnyway true
                    document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }, 100);
                }}
              >
                Continue anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 