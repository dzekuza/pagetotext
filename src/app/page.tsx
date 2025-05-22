"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import Image from "next/image";

const PDF_ICON = "/imagess/UPLOAD FILE.png"; // Use your PDF icon or fallback

// Animation helper for modal
function useModalAnimation(show: boolean) {
  const [shouldRender, setShouldRender] = useState(show);
  const modalRef = useRef(null);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else if (modalRef.current) {
      // Wait for animation out before removing from DOM
      const timeout = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timeout);
    } else {
      setShouldRender(false);
    }
  }, [show]);

  return { shouldRender, modalRef };
}

// Add SolanaProvider type above Home
interface SolanaProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);
  const [result, setResult] = useState<{ keywords: string | string[] | null; summary: string | null; main_argument?: string | null } | null>(null);
  const [polling, setPolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'keywords' | 'main_argument'>('summary');
  const [showModal, setShowModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);

  const { shouldRender: shouldShowModal, modalRef } = useModalAnimation(showModal);

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
        let keywords: string | string[] | null = data.keywords;
        // If keywords is a stringified array, parse it
        if (typeof keywords === 'string' && keywords.trim().startsWith('[')) {
          try {
            const parsed = JSON.parse(keywords);
            if (Array.isArray(parsed) && parsed.every((kw) => typeof kw === 'string')) {
              keywords = parsed as string[];
            } else {
              keywords = null;
            }
          } catch {
            keywords = null;
          }
        }
        setResult({ keywords, summary: data.summary, main_argument: data.main_argument });
        setPolling(false);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [uploadId, polling]);

  useEffect(() => {
    if (result) setShowModal(true);
  }, [result]);

  // Phantom wallet connect function
  async function connectPhantomWallet() {
    if (typeof window === 'undefined') return;
    const provider = (window as unknown as { solana?: SolanaProvider }).solana;
    if (provider && provider.isPhantom) {
      try {
        const resp = await provider.connect();
        setWalletAddress(resp.publicKey.toString());
        alert('Connected wallet: ' + resp.publicKey.toString());
      } catch {
        alert('Wallet connection cancelled or failed.');
      }
    } else {
      alert('Phantom wallet not found. Please install the Phantom extension.');
    }
  }

  // Copy wallet address to clipboard
  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      alert('Wallet address copied!');
    }
  };

  // Disconnect wallet
  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#111] flex flex-col justify-between p-0">
      {/* Top-right CTA */}
      <div className="absolute top-6 right-8 z-10">
        <div className="relative">
          <button
            className="bg-gradient-to-r from-green-400 to-green-200 text-black font-semibold rounded-lg px-5 py-2 shadow hover:brightness-110 transition-all text-sm"
            onClick={walletAddress ? () => setWalletDropdownOpen((v) => !v) : connectPhantomWallet}
          >
            {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Get access to all features'}
          </button>
          {/* Wallet Dropdown */}
          {walletAddress && walletDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#181818] border border-[#333] rounded-xl shadow-lg z-50 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between bg-[#232323] rounded-lg px-3 py-2">
                <span className="text-white text-sm truncate max-w-[140px]">{walletAddress}</span>
                <button onClick={handleCopyWallet} className="ml-2 text-green-300 hover:text-green-400" title="Copy address">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2"/></svg>
                </button>
              </div>
              <button
                className="w-full bg-gradient-to-r from-green-400 to-green-200 text-black font-bold rounded-lg px-4 py-2 text-sm shadow hover:brightness-110 transition-all"
                onClick={() => { setWalletDropdownOpen(false); connectPhantomWallet(); }}
              >
                Change wallet address
              </button>
              <button
                className="w-full bg-[#232323] text-red-400 font-bold rounded-lg px-4 py-2 text-sm shadow hover:bg-[#333] transition-all"
                onClick={handleDisconnectWallet}
              >
                Disconnect wallet
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-center flex-1 w-full max-w-7xl mx-auto gap-8 py-12 px-4">
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
        <div className="flex-1 max-w-md w-full bg-[#181818] rounded-2xl border border-[#222] shadow-lg flex flex-col items-center justify-center p-8 relative">
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
                setResult(null);
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
          {/* Results Modal */}
          {shouldShowModal && result && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-all duration-200">
              <div
                ref={modalRef}
                style={{
                  transition: 'opacity 0.2s, transform 0.2s',
                  opacity: showModal ? 1 : 0,
                  transform: showModal ? 'scale(1)' : 'scale(0.95)',
                }}
                className="relative bg-[#141414] rounded-2xl shadow-lg p-8 w-full max-w-xl flex flex-col items-center"
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                  onClick={() => { setShowModal(false); setResult(null); }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-extrabold mb-6 text-left w-full bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#FFFFFF] text-transparent bg-clip-text">Results</h2>
                <div className="flex w-full mb-6">
                  <button
                    className={`flex-1 py-2 rounded-l-lg text-lg font-semibold transition-all ${activeTab === 'summary' ? 'bg-[#232323] text-white' : 'bg-transparent text-gray-400'}`}
                    onClick={() => setActiveTab('summary')}
                  >
                    Summary
                  </button>
                  <button
                    className={`flex-1 py-2 text-lg font-semibold transition-all ${activeTab === 'keywords' ? 'bg-[#232323] text-white' : 'bg-transparent text-gray-400'}`}
                    onClick={() => setActiveTab('keywords')}
                  >
                    Keyword
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-r-lg text-lg font-semibold transition-all ${activeTab === 'main_argument' ? 'bg-[#232323] text-white' : 'bg-transparent text-gray-400'}`}
                    onClick={() => setActiveTab('main_argument')}
                  >
                    Main argument
                  </button>
                </div>
                {/* Sliding Tab Content */}
                <div
                  className="w-full min-h-[60px] flex items-center justify-center text-lg text-white mb-8 px-2 text-center overflow-hidden"
                  style={{ position: 'relative', height: 80 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: '300%',
                      transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                      transform:
                        activeTab === 'summary'
                          ? 'translateX(0%)'
                          : activeTab === 'keywords'
                          ? 'translateX(-33.3333%)'
                          : 'translateX(-66.6666%)',
                    }}
                  >
                    {/* Summary */}
                    <div style={{ width: '100%', flexShrink: 0, flexGrow: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {result.summary || 'N/A'}
                    </div>
                    {/* Keywords */}
                    <div style={{ width: '100%', flexShrink: 0, flexGrow: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Robust keywords rendering logic */}
                      {(() => {
                        let keywords = result.keywords;
                        // If keywords is a string that looks like a JSON array, parse it
                        if (typeof keywords === 'string' && keywords.trim().startsWith('[')) {
                          try {
                            const parsed = JSON.parse(keywords);
                            if (Array.isArray(parsed) && parsed.every((kw) => typeof kw === 'string')) {
                              keywords = parsed as string[];
                            } else {
                              keywords = null;
                            }
                          } catch {
                            keywords = null;
                          }
                        }
                        if (Array.isArray(keywords)) {
                          // Only map over string values
                          const filtered = keywords.filter((kw): kw is string => typeof kw === 'string' && kw.trim().length > 0);
                          if (filtered.length === 0) return 'N/A';
                          return (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                              {filtered.map((kw, i) => (
                                <span
                                  key={i}
                                  style={{
                                    background: 'linear-gradient(90deg, #232823 0%, #232823 100%)',
                                    color: '#fff',
                                    borderRadius: 8,
                                    padding: '8px 18px',
                                    fontSize: 18,
                                    marginBottom: 8,
                                    display: 'inline-block',
                                  }}
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          );
                        }
                        if (typeof keywords === 'string') return keywords || 'N/A';
                        // fallback: if keywords is array but not strings, join as string
                        if (Array.isArray(keywords)) {
                          const arr = keywords as string[];
                          if (arr.every((kw) => typeof kw === 'string')) {
                            return arr.join(', ');
                          }
                        }
                        return 'N/A';
                      })()}
                    </div>
                    {/* Main Argument */}
                    <div style={{ width: '100%', flexShrink: 0, flexGrow: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {result.main_argument || 'N/A'}
                    </div>
                  </div>
                </div>
                <button className="w-full mt-auto bg-gradient-to-r from-green-400 to-green-200 text-black font-bold rounded-lg px-4 py-3 text-lg shadow hover:brightness-110 transition-all" onClick={connectPhantomWallet}>
                  Login to save results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Bottom Feature Cards */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 px-4">
        <div className="bg-[#181818] rounded-2xl p-6 flex flex-col items-center text-center border border-[#222]">
          <div className="mb-3 flex items-center justify-center">
            <Image src="/imagess/UPLOAD FILE.png" alt="Upload File" width={40} height={40} />
          </div>
          <div className="font-bold text-lg text-white mb-1">Upload image or pdf file</div>
          <div className="text-gray-400 text-sm">Insert image of page&apos;s book or simply drag and drop PDF document</div>
        </div>
        <div className="bg-[#181818] rounded-2xl p-6 flex flex-col items-center text-center border border-[#222]">
          <div className="mb-3 flex items-center justify-center">
            <Image src="/imagess/ANALYZE IMAGE.png" alt="Analyze" width={40} height={40} />
          </div>
          <div className="font-bold text-lg text-white mb-1">Our AI will analyze it</div>
          <div className="text-gray-400 text-sm">BookReader will take care on the document by carefully analyzing it</div>
        </div>
        <div className="bg-[#181818] rounded-2xl p-6 flex flex-col items-center text-center border border-[#222]">
          <div className="mb-3 flex items-center justify-center">
            <Image src="/imagess/GET RESULTS.png" alt="Get Results" width={40} height={40} />
          </div>
          <div className="font-bold text-lg text-white mb-1">Get results</div>
          <div className="text-gray-400 text-sm">Receive summary of provided document, keywords and argument of passage</div>
        </div>
      </div>
    </div>
  );
}
