"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import Image from "next/image";
import UploadComponent from "./upload/UploadComponent";

export default function Home() {
  const [explainingIndex, setExplainingIndex] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

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
        {/* Features Section (screenshot style) */}
        <section className="w-full max-w-6xl mx-auto my-12 px-4">
          <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
            {/* Step 1 */}
            <div className="flex-1 bg-[#181818] rounded-2xl p-8 flex flex-col items-start shadow-lg">
              <Image src="/imagess/UPLOAD FILE.png" alt="Upload" width={64} height={64} className="mb-6" />
              <div className="flex items-baseline mb-2">
                <span className="text-green-300 text-xl font-bold mr-2">01</span>
                <span className="text-white text-xl font-bold">Upload image or pdf file</span>
              </div>
              <p className="text-gray-300">Insert image of page&apos;s book or simply drag and drop PDF document</p>
            </div>
            {/* Step 2 */}
            <div className="flex-1 bg-[#181818] rounded-2xl p-8 flex flex-col items-start shadow-lg">
              <Image src="/imagess/ANALYZE IMAGE.png" alt="Analyze" width={64} height={64} className="mb-6" />
              <div className="flex items-baseline mb-2">
                <span className="text-green-300 text-xl font-bold mr-2">02</span>
                <span className="text-white text-xl font-bold">Our AI will analyze it</span>
              </div>
              <p className="text-gray-300">BookReader will take care on the document by carefully analyzing it</p>
            </div>
            {/* Step 3 */}
            <div className="flex-1 bg-[#181818] rounded-2xl p-8 flex flex-col items-start shadow-lg">
              <Image src="/imagess/GET RESULTS.png" alt="Results" width={64} height={64} className="mb-6" />
              <div className="flex items-baseline mb-2">
                <span className="text-green-300 text-xl font-bold mr-2">03</span>
                <span className="text-white text-xl font-bold">Get results</span>
              </div>
              <p className="text-gray-300">Receive summary of provided document, keywords and argument of passage</p>
            </div>
            {/* Step 4 */}
            <div className="flex-1 bg-[#181818] rounded-2xl p-8 flex flex-col items-start shadow-lg">
              <Image src="/branding/A_flat_digital_vector_illustration_features_an_ico Background Removed.png" alt="Ask AI" width={64} height={64} className="mb-6" />
              <div className="flex items-baseline mb-2">
                <span className="text-green-300 text-xl font-bold mr-2">04</span>
                <span className="text-white text-xl font-bold">Ask AI</span>
              </div>
              <p className="text-gray-300">Still need more explanations? Ask chat widget powered by AI for better explanation</p>
            </div>
          </div>
        </section>
        {/* Coming Soon Features Section (side-scroll, reverted) */}
        <section className="w-full max-w-6xl mx-auto my-12 px-4">
          <div className="flex space-x-8 overflow-x-auto pb-4 hide-scrollbar">
            {/* Row 1 */}
            <div className="min-w-[700px] rounded-3xl p-8 md:p-12 flex flex-row gap-12 items-center bg-[#181818]">
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
            </div>
            {/* Row 2 */}
            <div className="min-w-[700px] rounded-3xl p-8 md:p-12 flex flex-row-reverse gap-12 items-center bg-[#181818]">
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
            </div>
            {/* Row 3 */}
            <div className="min-w-[700px] rounded-3xl p-8 md:p-12 flex flex-row gap-12 items-center bg-[#181818]">
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
            </div>
          </div>
        </section>
        {/* Waitlist Section */}
        <div className="w-full flex justify-center pb-16 px-4 md:px-0">
          <div
            className="w-full max-w-[1356px] rounded-3xl p-0 flex flex-col md:flex-row items-stretch shadow-lg bg-[#0F0F0F] relative" style={{ borderRadius: '24px', color: '#FFF', minHeight: 320 }}
          >
            {/* Left: Text and Form */}
            <div className="flex-1 flex flex-col justify-center px-8 py-12 md:py-0 md:pl-12 md:pr-0" style={{ minWidth: 0 }}>
              <h2 className="text-4xl md:text-[2.5rem] font-extrabold mb-2 text-left" style={{ lineHeight: '1.2em'}}>Get access to more features</h2>
              <p className="text-xl md:text-2xl font-semibold mb-8 text-left" style={{lineHeight: '1.4em', color: 'rgba(255,255,255,0.9)'}}>Join waitlist and be notified about upcoming features</p>
              {waitlistSuccess ? (
                <div className="flex items-center gap-3 bg-green-500/10 text-green-300 rounded-lg px-6 py-4 font-semibold text-lg shadow mt-2">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#7DDA7D"/><path d="M7 13l3 3 7-7" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  You have successfully joined the waitlist!
                </div>
              ) : (
                <form className="flex flex-col md:flex-row w-full gap-3" onSubmit={handleWaitlistSubmit}>
                  <div className="flex flex-1 bg-[#191919] border border-[#1E1E1E] rounded-lg overflow-hidden min-h-[52px]">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="flex-1 bg-transparent px-6 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-white/40 font-medium border-none"
                      value={waitlistEmail}
                      onChange={e => setWaitlistEmail(e.target.value)}
                      style={{ fontWeight: 500, fontSize: 20, lineHeight: '1.4em'}}
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg px-8 py-4 font-semibold text-lg border-0 transition min-w-[210px] min-h-[52px]"
                    style={{
                      background: 'linear-gradient(90deg, #7DDA7D 43%, #DBF5DB 84%, #FFF 100%)',
                      color: '#000',
                      
                      fontWeight: 600,
                      fontSize: 20,
                      lineHeight: '1.4em',
                    }}
                  >
                    Join waitlist now
                  </button>
                </form>
              )}
            </div>
            {/* Right: Illustration */}
            <div className="hidden md:flex flex-col justify-center items-center pr-12 pl-0" style={{ minWidth: 244 }}>
              <Image src="/branding/singglle.svg" alt="bg" width={244} height={224} style={{ maxWidth: 244, maxHeight: 224 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
