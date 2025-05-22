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

export default function ResultPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keywordExplanations, setKeywordExplanations] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const predefinedQuestions = [
    "Explain keywords",
    "Explain main argument",
    "Explain summary"
  ];

  const handleAskAI = useCallback(() => {
    setShowChat(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    setChatMessages([]);
    setChatLoading(false);
  }, []);

  const handleSelectQuestion = async (question: string) => {
    setChatMessages((msgs) => [...msgs, {role: 'user', text: question}]);
    setChatLoading(true);
    let context = '';
    if (question === 'Explain keywords') {
      context = keywords.map((kw, i) => `${kw}: ${keywordExplanations[i] || ''}`).join('\n');
    } else if (question === 'Explain main argument') {
      context = data?.main_argument || '';
    } else if (question === 'Explain summary') {
      context = data?.summary || '';
    }
    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });
      const result = await res.json();
      setChatMessages((msgs) => [...msgs, {role: 'ai', text: result.answer || result.error || 'No response from AI.'}]);
    } catch {
      setChatMessages((msgs) => [...msgs, {role: 'ai', text: 'Error contacting AI.'}]);
    }
    setChatLoading(false);
  };

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
                      {kw}
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
            {/* Ask AI Button and Chat Window */}
            <div className="mt-6 flex flex-col items-center">
              <button
                className="bg-gradient-to-r from-green-400 to-green-200 text-black font-bold rounded-lg px-6 py-2 shadow hover:from-green-300 hover:to-green-100 transition-colors"
                onClick={handleAskAI}
              >
                Ask AI
              </button>
              {showChat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                  <div className="bg-[#232323] rounded-2xl shadow-lg p-6 w-full max-w-md relative flex flex-col">
                    <button
                      className="absolute top-3 right-4 text-gray-400 hover:text-green-300 text-2xl font-bold"
                      onClick={handleCloseChat}
                      aria-label="Close chat"
                    >
                      ×
                    </button>
                    <div className="font-bold text-lg text-green-300 mb-2">Ask AI</div>
                    <div className="flex flex-col gap-2 mb-4">
                      {predefinedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          className="bg-[#181818] text-white rounded px-4 py-2 text-left hover:bg-green-900/30 border border-[#333]"
                          onClick={() => handleSelectQuestion(q)}
                          disabled={chatLoading}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto mb-2 max-h-60">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={msg.role === 'ai' ? 'text-green-200 mb-2' : 'text-white mb-2 text-right'}>
                          <span className="block px-2 py-1 rounded" style={{background: msg.role === 'ai' ? '#1a2e1a' : '#222'}}>{msg.text}</span>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="text-green-200 mb-2"><span className="block px-2 py-1 rounded bg-[#1a2e1a]">AI is typing...</span></div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 