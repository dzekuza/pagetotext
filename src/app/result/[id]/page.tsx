"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ResultData {
  summary: string | null;
  main_argument: string | null;
  keywords: string | string[] | null;
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
        .select('summary, main_argument, keywords')
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
    <div className="min-h-screen bg-[#111] flex flex-col p-0">
      <div className="w-full max-w-4xl mx-auto mt-16 mb-8 px-4">
        <Link href="/" className="text-gray-300 hover:text-green-300 text-lg mb-6 inline-block">Back</Link>
        <div className="bg-[#181818] rounded-2xl p-8">
          <h2 className="text-3xl font-extrabold mb-8 text-green-300">Results</h2>
          <div className="grid grid-cols-1 gap-6">
            {/* Summary Card */}
            <div className="bg-[#232323] rounded-xl p-6 flex flex-col">
              <div className="font-bold text-xl text-white mb-2">Summary</div>
              <div className="text-gray-300 text-base">{data.summary || 'N/A'}</div>
            </div>
            {/* Main Argument Card */}
            <div className="bg-[#232323] rounded-xl p-6 flex flex-col">
              <div className="font-bold text-xl text-white mb-2">Main argument</div>
              <div className="text-gray-300 text-base">{data.main_argument || 'N/A'}</div>
            </div>
            {/* Keywords Card */}
            <div className="bg-[#232323] rounded-xl p-6 flex flex-col">
              <div className="font-bold text-xl text-white mb-2">Keywords</div>
              <div className="flex flex-wrap gap-3 mt-2">
                {keywords.length > 0 ? (
                  keywords.map((kw, i) => (
                    <span key={i} style={{ display: 'inline-block', minWidth: 120 }} className="bg-gradient-to-r from-[#232823] to-[#232823] text-white rounded px-4 py-2 text-base flex flex-col items-center">
                      <span className="flex items-center gap-2">
                        {kw}
                        {isCryptoRelated(kw) && (
                          <span className="ml-2 bg-green-900 text-green-300 px-2 py-0.5 rounded text-xs font-semibold">crypto related</span>
                        )}
                      </span>
                      <span className="block text-green-200 text-xs mt-2" style={{whiteSpace: 'pre-line', textAlign: 'center'}}>
                        {keywordExplanations[i] || '...'}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
            </div>
            {/* Floating AI Chat Bubble and Widget */}
            <>
              {!showChat && (
                <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
                  <span className="text-white bg-[#232323] px-4 py-2 rounded-lg shadow text-base font-medium hidden md:inline-block">Ask me anything about your upload&apos;s analysis</span>
                  <button
                    className="bg-gradient-to-r from-green-400 to-green-200 text-black rounded-full shadow-lg w-16 h-16 flex items-center justify-center hover:scale-105 transition-transform"
                    style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)' }}
                    onClick={() => setShowChat(true)}
                    aria-label="Open AI Chat"
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="16" fill="#95ED7F"/>
                      <text x="16" y="22" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#232823" fontFamily="inherit">?</text>
                    </svg>
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
        </div>
      </div>
    </div>
  );
} 