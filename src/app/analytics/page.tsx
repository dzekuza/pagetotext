"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../supabaseClient";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

interface Upload {
  id: number;
  summary: string | null;
  keywords: string | null;
  created_at?: string;
  image_url?: string;
}

export default function AnalyticsPage() {
  const { publicKey, connected } = useWallet();
  const [uploads, setUploads] = useState<Upload[]>([]);

  useEffect(() => {
    if (!connected || !publicKey) {
      setUploads([]);
      return;
    }
    async function fetchUploads() {
      const { data, error } = await supabase
        .from("uploads")
        .select("id, summary, keywords, created_at, image_url")
        .eq("wallet", publicKey?.toBase58())
        .order("created_at", { ascending: false });
      if (error) {
        setUploads([]);
      } else {
        setUploads(data || []);
      }
    }
    fetchUploads();
  }, [connected, publicKey]);

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-0 px-4 md:px-16">
        <div className="bg-[#181818] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-300">Connect your wallet to view your analytics history</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#111] flex flex-col p-0 px-4 md:px-16">
      <div className="w-full max-w-7xl mx-auto mt-12 mb-8 px-4">
        <div className="text-green-300 font-extrabold text-2xl mb-8">Analytics history</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {uploads.length > 0 ? (
            uploads.map((upload) => {
              // Determine file type and icon
              const icon = (upload.image_url && (upload.image_url.endsWith('.pdf') || upload.image_url.includes('.pdf')))
                ? "/imagess/A_2D_digital_vector_icon_features_a_pale_green_doc-BackgroundRemoved.png"
                : "/imagess/UPLOAD IMAGE.png";
              // Try to get file name from image_url
              let fileName = "File name";
              if (upload.image_url) {
                const parts = upload.image_url.split("/");
                fileName = parts[parts.length - 1] || fileName;
              }
              // Parse keywords
              let keywords: string[] = [];
              if (typeof upload.keywords === 'string' && upload.keywords.trim().startsWith('[')) {
                try {
                  const parsed = JSON.parse(upload.keywords);
                  if (Array.isArray(parsed) && parsed.every((kw: string) => typeof kw === 'string')) {
                    keywords = parsed;
                  }
                } catch {}
              } else if (Array.isArray(upload.keywords)) {
                keywords = upload.keywords.filter((kw: string) => typeof kw === 'string');
              }
              // Truncate summary
              let summary = upload.summary || "Insert image of page's book or simply drag and drop PDF document";
              if (summary.length > 50) summary = summary.slice(0, 50) + "...";
              return (
                <Link
                  key={upload.id}
                  href={`/result/${upload.id}`}
                  className="bg-[#181818] rounded-2xl border border-[#222] shadow-lg p-6 flex flex-col mb-4 transition hover:border-green-400 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  tabIndex={0}
                >
                  <div className="font-bold text-white text-lg mb-4">{fileName}</div>
                  <div className="flex items-center justify-center w-full h-40 bg-gradient-to-br from-[#232823] to-[#232823] rounded-xl mb-4">
                    <Image src={icon} alt="Preview" width={96} height={96} />
                  </div>
                  <div className="text-gray-300 text-sm mb-4">{summary}</div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.length > 0 ? (
                      keywords.map((kw, i) => (
                        <span key={i} className="bg-white text-black rounded px-3 py-1 text-xs font-semibold shadow-sm">{kw}</span>
                      ))
                    ) : (
                      <span className="bg-white text-black rounded px-3 py-1 text-xs font-semibold shadow-sm">Keyword</span>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-gray-400 col-span-full text-center">No uploads found.</div>
          )}
        </div>
      </div>
    </div>
  );
} 