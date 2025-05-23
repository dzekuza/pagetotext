"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { supabase } from "./supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const PDF_ICON = "/imagess/UPLOAD FILE.png"; // Use your PDF icon or fallback

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [explainingIndex, setExplainingIndex] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);
  const [uploadAreaSize, setUploadAreaSize] = useState({ width: 0, height: 0 });
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const router = useRouter();

  useLayoutEffect(() => {
    function updateSize() {
      if (uploadAreaRef.current) {
        setUploadAreaSize({
          width: uploadAreaRef.current.offsetWidth,
          height: uploadAreaRef.current.offsetHeight,
        });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
    setSuccess(null);
    setUploadId(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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
        setPolling(false);
        clearInterval(interval);
        // Redirect to results page
        router.push(`/result/${uploadId}`);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [uploadId, polling, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setExplainingIndex(null);
      }
    }
    if (explainingIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [explainingIndex]);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistSuccess(true);
    setWaitlistEmail("");
  };

  return (
    <div className="min-h-screen bg-[#111] flex flex-col justify-between p-0">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-center flex-1 w-full max-w-4xl mx-auto gap-8 py-12 px-4 relative z-10">
        {/* Left: Headline & Features */}
        <div className="flex-1 max-w-lg text-left">
          <h1 className="text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#FFFFFF] text-transparent bg-clip-text">Snap Anything,<br />Get the Alpha</h1>
          <p className="text-gray-200 text-lg mb-8">Whether it&apos;s a whitepaper, tweet thread, or on-chain post, AlphaSnap lets users take a screenshot or paste text and instantly get:</p>
          <ul className="space-y-3 mb-2">
            <li className="flex items-center bg-[#181818] rounded-xl px-6 py-3">
              <Image src="/imagess/TICK ICON.png" alt="Tick" width={28} height={28} className="mr-3" />
              <span className="text-[#e6ffe6] text-base">Summary in plain English (or degen-speak)</span>
            </li>
            <li className="flex items-center bg-[#181818] rounded-xl px-6 py-3">
              <Image src="/imagess/TICK ICON.png" alt="Tick" width={28} height={28} className="mr-3" />
              <span className="text-[#e6ffe6] text-base">Keywords & definitions (DePIN, restaking, MEV, etc.)</span>
            </li>
            <li className="flex items-center bg-[#181818] rounded-xl px-6 py-3">
              <Image src="/imagess/TICK ICON.png" alt="Tick" width={28} height={28} className="mr-3" />
              <span className="text-[#e6ffe6] text-base">Main argument or narrative (What are they actually saying?)</span>
            </li>
          </ul>
        </div>
        {/* Right: Upload Area */}
        <div ref={uploadAreaRef} className="flex-1 max-w-md w-full bg-[#181818] rounded-2xl border border-[#222] shadow-lg flex flex-col items-center justify-center p-8 relative overflow-visible">
          {/* Animated SVG Stroke Effect (short segment, correct border radius) */}
          {uploadAreaSize.width > 0 && uploadAreaSize.height > 0 && (
            <motion.svg
              width={uploadAreaSize.width}
              height={uploadAreaSize.height}
              viewBox={`0 0 ${uploadAreaSize.width} ${uploadAreaSize.height}`}
              className="absolute top-0 left-0 z-10 pointer-events-none"
              style={{ borderRadius: 24 }}
            >
              <defs>
                <linearGradient id="stroke-gradient" x1="0" y1="0" x2={uploadAreaSize.width} y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(0,255,178,0)" />
                  <stop offset="100%" stopColor="rgb(0,255,178)" />
                </linearGradient>
                <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <motion.rect
                x={1.5}
                y={1.5}
                width={uploadAreaSize.width - 3}
                height={uploadAreaSize.height - 3}
                rx={32}
                ry={32}
                stroke="url(#stroke-gradient)"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={24 + ',' + (2 * (uploadAreaSize.width + uploadAreaSize.height - 6) - 24)}
                animate={{ strokeDashoffset: [0, -(2 * (uploadAreaSize.width + uploadAreaSize.height - 6))] }}
                transition={{ duration: 5, ease: "linear", repeat: Infinity, repeatType: "loop" }}
                filter="url(#glow)"
              />
            </motion.svg>
          )}
          <form
            onSubmit={handleUpload}
            className="flex flex-col gap-4 w-full"
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
                setError(null);
                setSuccess(null);
                setUploadId(null);
              }
            }}
          >
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-[#333] rounded-xl p-8 cursor-pointer hover:border-green-400 transition-colors bg-[#161616] mb-2"
            >
              <Image
                src="/imagess/UPLOAD IMAGE.png"
                alt="Upload icon"
                width={72}
                height={72}
                className="mb-2"
              />
              <span className="text-green-300 font-semibold text-lg">Click to upload</span>
              <span className="text-gray-400">or drag and drop</span>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            {/* File Preview */}
            {file && !uploading && (
              <div className="flex flex-col items-center mb-2">
                {file.type.startsWith('image/') ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="max-h-32 rounded-lg border border-[#333] mb-1"
                    unoptimized
                  />
                ) : file.type === 'application/pdf' ? (
                  <div className="flex items-center gap-2 bg-[#232323] rounded-lg px-3 py-2">
                    <Image src={PDF_ICON} alt="PDF" width={32} height={32} />
                    <span className="text-white text-sm truncate max-w-[180px]">{file.name}</span>
                  </div>
                ) : null}
              </div>
            )}
            {/* Upload Animation */}
            {uploading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <svg className="animate-spin h-10 w-10 text-green-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="text-green-300 font-semibold">Uploading...</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={uploading || !file}
                className="bg-gradient-to-r from-green-400 to-green-200 text-black font-bold rounded-lg px-4 py-2 disabled:opacity-50 mt-2"
              >
                Analyze you document for free
              </button>
            )}
            {error && <div className="text-red-400 text-sm">{error}</div>}
            {success && <div className="text-green-400 text-sm">{success}</div>}
            {polling && <div className="mt-4 text-green-300 text-sm">Processing... Please wait.</div>}
          </form>
        </div>
      </div>
      {/* Bottom Feature Cards */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 px-4">
        <div className="bg-[#181818] rounded-2xl p-6 flex flex-col items-start text-left border border-[#222]">
          <div className="mb-3 flex items-center justify-center">
            <Image src="/imagess/UPLOAD FILE.png" alt="Upload File" width={40} height={40} />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-extrabold text-xl bg-gradient-to-r from-green-400 to-green-200 text-transparent bg-clip-text">01</span>
            <span className="font-bold text-lg text-white">Upload image or pdf file</span>
          </div>
          <div className="text-gray-400 text-sm">Insert image of page&apos;s book or simply drag and drop PDF document</div>
        </div>
        <div className="bg-[#181818] rounded-2xl p-6 flex flex-col items-start text-left border border-[#222]">
          <div className="mb-3 flex items-center justify-center">
            <Image src="/imagess/ANALYZE IMAGE.png" alt="Analyze" width={40} height={40} />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-extrabold text-xl bg-gradient-to-r from-green-400 to-green-200 text-transparent bg-clip-text">02</span>
            <span className="font-bold text-lg text-white">Our AI will analyze it</span>
          </div>
          <div className="text-gray-400 text-sm">BookReader will take care on the document by carefully analyzing it</div>
        </div>
        <div className="bg-[#181818] rounded-2xl p-6 flex flex-col items-start text-left border border-[#222]">
          <div className="mb-3 flex items-center justify-center">
            <Image src="/imagess/GET RESULTS.png" alt="Get Results" width={40} height={40} />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-extrabold text-xl bg-gradient-to-r from-green-400 to-green-200 text-transparent bg-clip-text">03</span>
            <span className="font-bold text-lg text-white">Get results</span>
          </div>
          <div className="text-gray-400 text-sm">Receive summary of provided document, keywords and argument of passage</div>
        </div>
      </div>
      {/* Waitlist Section */}
      <div className="w-full flex justify-center pb-16 px-4">
        <div className="w-full max-w-4xl bg-gradient-to-r from-green-300 via-green-200 to-white rounded-2xl p-8 md:p-10 flex flex-col items-start shadow-lg">
          <h2 className="text-3xl font-bold text-black mb-2">Get access to more features</h2>
          <p className="text-lg text-black mb-6">Join waitlist and be notified about upcoming features</p>
          {waitlistSuccess ? (
            <div className="text-green-800 bg-white bg-opacity-80 rounded-lg px-4 py-3 font-semibold text-lg shadow">You have successfully joined the waitlist with your wallet address!</div>
          ) : (
            <form className="flex flex-col md:flex-row w-full gap-3" onSubmit={handleWaitlistSubmit}>
              <input
                type="text"
                required
                placeholder="Enter your wallet address"
                className="flex-1 rounded-lg px-4 py-3 border border-green-200 bg-white bg-opacity-60 text-black text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                value={waitlistEmail}
                onChange={e => setWaitlistEmail(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-lg px-6 py-3 bg-white text-black font-bold text-lg border border-green-200 hover:bg-green-100 transition"
              >
                Join waitlist now
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
