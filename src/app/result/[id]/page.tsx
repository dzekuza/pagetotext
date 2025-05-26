"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from "@solana/wallet-adapter-react";
import Button from '../../../../components/Button';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ResultData {
  summary: string | null;
  main_argument: string | null;
  keywords: string | string[] | null;
  image_url?: string | null;
}

// Utility: simple crypto keyword matcher
const CRYPTO_KEYWORDS = [
  'crypto', 'blockchain', 'defi', 'nft', 'token', 'web3', 'ethereum', 'solana', 'bitcoin', 'wallet', 'staking', 'mev', 'dep', 'restaking', 'layer', 'rollup', 'zk', 'dao', 'dapp', 'smart contract', 'airdrop', 'dex', 'cex', 'l2', 'l1', 'evm', 'bridge', 'oracle', 'stablecoin', 'yield', 'liquidity', 'validator', 'gas', 'hash', 'mining', 'consensus', 'governance', 'multisig', 'ledger', 'phishing', 'rug', 'scam', 'pump', 'dump', 'alpha', 'beta', 'gamma', 'delta', 'sigma', 'tau', 'theta', 'lambda'
];
function isCryptoRelated(keyword: string) {
  return CRYPTO_KEYWORDS.some(term => keyword.toLowerCase().includes(term));
}

export default function ResultPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keywordExplanations, setKeywordExplanations] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { publicKey, connected } = useWallet();

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    setChatMessages([]);
    setChatLoading(false);
  }, []);

  // Fetch result from Supabase on mount
  useEffect(() => {
    async function fetchResult() {
      const { data, error } = await supabase
        .from('uploads')
        .select('summary, main_argument, keywords, image_url')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError("Result Not Found");
      } else {
        setData(data);
      }
    }
    if (id) fetchResult();
  }, [id]);

  // Parse keywords
  const keywords: string[] = useMemo(() => {
    if (!data) return [];
    if (typeof data.keywords === 'string' && data.keywords.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(data.keywords);
        if (Array.isArray(parsed) && parsed.every((kw: string) => typeof kw === 'string')) {
          return parsed;
        }
      } catch {}
    } else if (Array.isArray(data.keywords)) {
      return data.keywords.filter((kw: string) => typeof kw === 'string');
    }
    return [];
  }, [data]);

  // Fetch explanations for all keywords when keywords are available
  useEffect(() => {
    async function fetchExplanations() {
      if (keywords.length === 0) {
        setKeywordExplanations([]);
        return;
      }
      const results: string[] = await Promise.all(
        keywords.map(async (keyword) => {
          try {
            const res = await fetch("/api/explain-keyword", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ keyword }),
            });
            const data = await res.json();
            return data.explanation || "No explanation found.";
          } catch {
            return "Error fetching explanation.";
          }
        })
      );
      setKeywordExplanations(results);
    }
    fetchExplanations();
  }, [data, keywords]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (showChat && chatMessages.length === 0) {
      setChatMessages([
        { role: 'ai', text: "Welcome, do you have any questions related to received analysis?" }
      ]);
    }
  }, [showChat, chatMessages.length]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white">
        <div className="bg-[#181818] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-300">{error}</h2>
          <Link href="/" className="text-green-400 underline">Back to Home</Link>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white">
        <div className="bg-[#181818] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-300">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] flex flex-col p-0 px-4 md:px-16">
      <div className="w-full max-w-6xl mx-auto mt-16 mb-8 px-4">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-300 hover:text-green-300 text-lg inline-block"
          >
            Back
          </button>
          <Button className="text-lg py-3 px-6 md:w-auto w-full" onClick={() => setShowUploadModal(true)}>
            Generate another analysis
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Your upload card */}
          <div
            className="bg-[#181818] rounded-2xl border border-[#222] shadow-lg p-8 flex flex-col items-center"
            style={{ height: 'fit-content', width: '100%', maxWidth: '100%', flexBasis: '30%', flexGrow: 0, flexShrink: 0 }}
          >
            <div className="w-full mb-6">
              <div className="text-green-300 font-extrabold text-2xl mb-4">Your upload</div>
              {data?.image_url ? (
                data.image_url.endsWith('.pdf') ? (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${data.image_url}`}
                    title="PDF Preview"
                    className="w-full max-w-md aspect-[4/5] rounded-lg border border-[#333] bg-white"
                    style={{ minHeight: 400 }}
                  />
                ) : (
                  <Image
                    src={
                      data.image_url.startsWith('http')
                        ? data.image_url
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${data.image_url}`
                    }
                    alt="Uploaded Preview"
                    width={320}
                    height={320}
                    className="rounded-xl border border-[#333] object-contain bg-black w-full max-w-md"
                    unoptimized
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center w-full bg-[#232323] rounded-xl border border-[#333] p-6">
                  <Image src="/imagess/UPLOAD FILE.png" alt="No Preview" width={64} height={64} />
                  <span className="text-gray-400 mt-2">No preview available</span>
                </div>
              )}
            </div>
          </div>
          {/* Right: Analysis card */}
          <div className="bg-[#181818] rounded-2xl border border-[#222] shadow-lg p-8 flex flex-col min-h-[480px]"
            style={{ width: '100%', maxWidth: '100%', flexBasis: '70%', flexGrow: 1, flexShrink: 1 }}>
            <div className="text-green-300 font-extrabold text-2xl mb-6">Analysis</div>
            {/* Summary */}
            <div className="mb-6">
              <div className="text-green-300 font-bold text-lg mb-2">Summary</div>
              <div className="text-gray-200 text-base bg-[#232323] rounded-xl p-4">{data.summary || 'N/A'}</div>
            </div>
            {/* Main Argument */}
            <div className="mb-6">
              <div className="text-green-300 font-bold text-lg mb-2">Main argument</div>
              <div className="text-gray-200 text-base bg-[#232323] rounded-xl p-4">{data.main_argument || 'N/A'}</div>
            </div>
            {/* Keywords */}
            <div>
              <div className="text-green-300 font-bold text-lg mb-2">Keywords</div>
              <div className="flex flex-col gap-4">
                {keywords.length > 0 ? (
                  keywords.map((kw, i) => (
                    <div key={i} className="bg-[#232323] rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold rounded-full text-base text-white">
                          {kw}
                        </span>
                        {isCryptoRelated(kw) && (
                          <span className="bg-green-900 text-white px-3 py-1 rounded-full text-xs font-semibold">crypto related</span>
                        )}
                      </div>
                      <span className="block text-green-200 text-xs mt-1" style={{whiteSpace: 'pre-line', textAlign: 'left'}}>
                        {keywordExplanations[i] || '...'}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Floating AI Chat Bubble and Widget */}
        <>
          {!showChat && (
            <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
              <span className="text-white bg-[#232323] px-4 py-2 rounded-lg shadow text-base font-medium hidden md:inline-block">Ask me anything about your upload&apos;s analysis</span>
              <button
                className="w-16 h-16 flex items-center justify-center hover:scale-105 transition-transform bg-transparent shadow-none p-0 animate-pulse-grow"
                onClick={() => setShowChat(true)}
                aria-label="Open AI Chat"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-[#A8FF78] via-[#7DDA7D] to-[#95ED7F]">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="block" style={{ display: 'block' }}>
                    <text x="16" y="24" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#fff" fontFamily="inherit">?</text>
                  </svg>
                </div>
              </button>
            </div>
          )}
          {showChat && (
            <div className="fixed bottom-8 right-8 z-50 w-96 max-w-full bg-[#232323] rounded-2xl shadow-2xl flex flex-col" style={{ minHeight: 420 }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#333] rounded-t-2xl bg-[#232323]">
                <span className="font-bold text-lg text-green-300">AI Chat</span>
                <button
                  className="text-gray-400 hover:text-green-300 text-2xl font-bold"
                  onClick={handleCloseChat}
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2" style={{ maxHeight: 300 }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={msg.role === 'ai' ? 'text-green-200 mb-2' : 'text-white mb-2 text-right'}>
                    <span className="block px-2 py-1 rounded" style={{background: msg.role === 'ai' ? '#1a2e1a' : '#222'}}>{msg.text}</span>
                  </div>
                ))}
                {chatLoading && (
                  <div className="text-green-200 mb-2"><span className="block px-2 py-1 rounded bg-[#1a2e1a]">AI is typing...</span></div>
                )}
              </div>
              <form
                className="flex items-center gap-2 border-t border-[#333] px-4 py-3 bg-[#232323] rounded-b-2xl"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('userInput') as HTMLInputElement;
                  const userInput = input.value.trim();
                  if (!userInput) return;
                  setChatMessages((msgs) => [...msgs, { role: 'user', text: userInput }]);
                  setChatLoading(true);
                  input.value = '';
                  try {
                    const res = await fetch('/api/ask-ai', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ question: userInput, context: `${data.summary || ''}\n${data.main_argument || ''}\n${keywords.join(', ')}` }),
                    });
                    const result = await res.json();
                    setChatMessages((msgs) => [...msgs, { role: 'ai', text: result.answer || result.error || 'No response from AI.' }]);
                  } catch {
                    setChatMessages((msgs) => [...msgs, { role: 'ai', text: 'Error contacting AI.' }]);
                  }
                  setChatLoading(false);
                }}
              >
                <input
                  name="userInput"
                  type="text"
                  className="flex-1 rounded-lg bg-[#181818] text-white px-3 py-2 border border-[#333] focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Ask anything about these results..."
                  autoComplete="off"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-400 to-green-200 text-black font-bold rounded-lg px-4 py-2 disabled:opacity-50"
                  disabled={chatLoading}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </>
      </div>
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="rounded-2xl bg-[#181818] p-8 w-[540px] max-w-full flex flex-col shadow-lg relative">
            <button
              className="absolute top-4 right-5 text-gray-400 hover:text-green-300 text-2xl font-bold"
              onClick={() => setShowUploadModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-green-300 mb-4">Analyze another document</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setUploadError(null);
                setUploadSuccess(null);
                if (!file) {
                  setUploadError("Please select a file.");
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
                  setUploadError(uploadError.message);
                  setUploading(false);
                  return;
                }
                if (!connected || !publicKey) {
                  setUploadError("Please connect your wallet to upload.");
                  setUploading(false);
                  return;
                }
                // Insert DB record for n8n automation
                const { data: insertData, error: dbError } = await supabase.from('uploads').insert([
                  {
                    image_url: data?.path,
                    status: 'pending',
                    wallet: publicKey.toBase58(),
                  },
                ]).select('id');
                if (dbError) {
                  setUploadError(dbError.message);
                  setUploading(false);
                  return;
                }
                const newId = insertData?.[0]?.id;
                // Trigger n8n webhook
                await fetch("https://n8n.srv824584.hstgr.cloud/webhook/webhook", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ uploadId: newId })
                });
                setUploadSuccess("Upload successful! Processing will start soon.");
                setUploading(false);
                setFile(null);
                setShowUploadModal(false);
                // Redirect to new result page
                window.location.href = `/result/${newId}`;
              }}
              className="flex flex-col gap-4 w-full"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setFile(e.dataTransfer.files[0]);
                  setUploadError(null);
                  setUploadSuccess(null);
                }
              }}
            >
              <label
                htmlFor="file-upload-modal"
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
                id="file-upload-modal"
                type="file"
                accept="image/*,application/pdf"
                onChange={e => {
                  setFile(e.target.files?.[0] || null);
                  setUploadError(null);
                  setUploadSuccess(null);
                }}
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
                      <Image src="/imagess/UPLOAD FILE.png" alt="PDF" width={32} height={32} />
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
                  <span className="text-green-300 font-semibold">Analyzing your upload...</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="bg-gradient-to-r from-green-400 to-green-200 text-black font-bold rounded-lg px-4 py-2 disabled:opacity-50 mt-2"
                >
                  Analyze your document for free
                </button>
              )}
              {uploadError && <div className="text-red-400 text-sm">{uploadError}</div>}
              {uploadSuccess && <div className="text-green-400 text-sm">{uploadSuccess}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 