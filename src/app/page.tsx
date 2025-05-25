"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { supabase } from "./supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UploadComponent from "./upload/UploadComponent";

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

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Insert into Supabase waitlist table with subscribed: true
    const { error } = await supabase
      .from('waitlist')
      .insert([{ wallet: waitlistEmail }]);
    if (!error) {
      setWaitlistSuccess(true);
      setWaitlistEmail("");
    } else {
      // Optionally show error to user
      setWaitlistSuccess(false);
      // You can add error handling UI here if desired
    }
  };

  return (
    <div className="min-h-screen bg-[#111] flex flex-col justify-between p-0">
      <div className="w-full max-w-[1420px] mx-auto px-0 md:px-16">
        {/* Hero Section */}
        <div
          className="flex flex-col md:flex-row items-center justify-center flex-1 w-full gap-8 py-12 relative z-10 px-4 md:px-0"
          style={{
            backgroundImage: 'url(/branding/1stbg.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
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
          <div className="flex-1 max-w-md w-full">
            <UploadComponent standalone={false} />
          </div>
        </div>
        {/* New Coming Soon Features Section */}
        <section className="w-full max-w-6xl mx-auto my-12 px-4">
          <div className="flex flex-col gap-10"s
            {/* Row 1 */}
            <div className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center" style={{background: 'linear-gradient(90deg, #136B0A 0%, #7DDA7D 43%, #058B05 100%)'}}>
              {/* Left: Text */}
              <div className="flex-1 flex flex-col gap-8 max-w-xl">
                <div className="flex flex-col gap-2">
                  <span className="inline-block bg-white text-[#111] text-xs font-bold rounded px-4 py-1 w-max shadow">Coming soon</span>
                  <h3 className="text-3xl font-extrabold text-white">Narrative Tracker / Buzz Radar</h3>
                  <p className="text-white/90 text-lg">Scan any screenshot, doc, or tweet to receive following data:</p>
                </div>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold text-white">Narrative fit</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold text-white">Affected tokens or sectors</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold text-white">Historical context</span>
                  </div>
                </div>
              </div>
              {/* Right: Image */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-64 md:h-80 flex items-center justify-center">
                  <img src="/imagess/narrative.png" alt="Narrative Tracker Illustration" className="object-contain" />
                </div>
              </div>
            </div>
            {/* Row 2 */}
            <div className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row-reverse gap-12 items-center" style={{background: 'linear-gradient(90deg, #136B0A 0%, #7DDA7D 43%, #058B05 100%)'}}>
              {/* Left: Text */}
              <div className="flex-1 flex flex-col gap-8 max-w-xl">
                <div className="flex flex-col gap-2">
                  <span className="inline-block bg-white text-[#111] text-xs font-bold rounded px-4 py-1 w-max shadow">Coming soon</span>
                  <h3 className="text-3xl font-extrabold text-white">DeFi Flow Explainer</h3>
                  <p className="text-white/90 text-lg">Upload a screenshot of a transaction (e.g., from Etherscan, DeBank, Zapper) or a snippet from a DeFi protocol doc to receive:</p>
                </div>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold text-white">Transaction breakdown</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold text-white">Protocols/contracts involved</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold text-white">Potential risks</span>
                  </div>
                </div>
                <div className="bg-white/90 rounded-xl px-5 py-3 mt-2">
                  <div className="text-xs font-bold text-gray-800 mb-1">Use case:</div>
                  <div className="text-sm text-gray-800">Useful for newer degens trying out a yield farm or bridging to Layer 2s.</div>
                </div>
              </div>
              {/* Right: Image */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-64 md:h-80 flex items-center justify-center">
                  <img src="/imagess/defi flow.png" alt="DeFi Flow Illustration" className="object-contain" />
                </div>
              </div>
            </div>
            {/* Row 3 */}
            <div className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center" style={{background: 'linear-gradient(90deg, #136B0A 0%, #7DDA7D 43%, #058B05 100%)'}}>
              {/* Left: Text */}
              <div className="flex-1 flex flex-col gap-8 max-w-xl">
                <div className="flex flex-col gap-2">
                  <span className="inline-block bg-white text-[#111] text-xs font-bold rounded px-4 py-1 w-max shadow">Coming soon</span>
                  <h3 className="text-3xl font-extrabold text-white">Smart Contract TL;DR</h3>
                  <p className="text-white/90 text-lg">Take a snippet from a contract (or a screenshot from an audit report) to receive:</p>
                </div>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold text-white">Plain English breakdown</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold text-white">Contract workflow</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold text-white">Potential red flags</span>
                  </div>
                </div>
                <div className="bg-white/90 rounded-xl px-5 py-3 mt-2">
                  <div className="text-xs font-bold text-gray-800 mb-1">Use case:</div>
                  <div className="text-sm text-gray-800">Devs and non-devs alike can understand smart contract intent & risk.</div>
                </div>
              </div>
              {/* Right: Image */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-64 md:h-80 flex items-center justify-center">
                  <img src="/imagess/smart cont.png" alt="Smart Contract Illustration" className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Waitlist Section */}
        <div className="w-full flex justify-center pb-16 px-4 md:px-0">
          <div
            className="w-full rounded-2xl p-8 md:p-10 flex flex-col items-start shadow-lg"
            style={{
              background: 'linear-gradient(90deg, #136B0A 0%, #7DDA7D 43%, #058B05 100%)',
              color: '#111',
            }}
          >
            <h2 className="text-3xl font-bold text-black mb-2" style={{color: '#FFF'}}>Get access to more features</h2>
            <p className="text-lg text-black mb-6" style={{color: '#fff'}}>Join waitlist and be notified about upcoming features</p>
            {waitlistSuccess ? (
              <div className="text-green-800 bg-white bg-opacity-80 rounded-lg px-4 py-3 font-semibold text-lg shadow" style={{color: '#111'}}>You have successfully joined the waitlist with your wallet address!</div>
            ) : (
              <form className="flex flex-col md:flex-row w-full gap-3" onSubmit={handleWaitlistSubmit} style={{color: '#111'}}>
                <input
                  type="text"
                  required
                  placeholder="Enter your wallet address"
                  className="flex-1 rounded-lg px-4 py-3 border border-green-200 bg-white bg-opacity-60 text-black text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  style={{color: '#111'}}
                />
                <button
                  type="submit"
                  className="rounded-lg px-6 py-3 bg-white text-black font-bold text-lg border border-green-200 hover:bg-green-100 transition"
                  style={{color: '#111'}}
                >
                  Join waitlist now
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
