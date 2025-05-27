"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import Image from "next/image";
import UploadComponent from "./upload/UploadComponent";
import Button from '../../components/Button';

// Add fade-in animation logic
const useFadeInOnScroll = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);
  return [ref, visible] as const;
};

export default function Home() {
  const [explainingIndex, setExplainingIndex] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [caCopied, setCaCopied] = useState(false);
  const comingFeaturesRef = useRef<HTMLDivElement | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  // Fade-in hooks for major sections
  const [heroRef, heroVisible] = useFadeInOnScroll();
  const [featuresRef, featuresVisible] = useFadeInOnScroll();
  const [missionRef] = useFadeInOnScroll();
  const [tokenRef] = useFadeInOnScroll();
  const [poweredRef, poweredVisible] = useFadeInOnScroll();

  // Drag-to-scroll for utility section
  const utilitySliderRef = useRef<HTMLDivElement | null>(null);
  const [isUtilityDragging, setIsUtilityDragging] = useState(false);
  const [utilityDragStartX, setUtilityDragStartX] = useState<number | null>(null);
  const [utilityScrollLeft, setUtilityScrollLeft] = useState<number>(0);

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

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setShowScrollHint(true);
        setTimeout(() => setShowScrollHint(false), 1200); // Animation duration
      }
    };
    const ref = comingFeaturesRef.current;
    const observer = new window.IntersectionObserver(handleIntersection, {
      threshold: 0.3,
    });
    if (ref) {
      observer.observe(ref);
    }
    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Insert into Supabase waitlist table with subscribed: true
    const { error } = await supabase
      .from('waitlist')
      .insert([{ contact: waitlistEmail }]);
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
    <div className="min-h-screen bg-[#111] flex flex-col justify-between p-0" style={{ scrollBehavior: 'smooth' }}>
      <div className="w-full max-w-[1420px] mx-auto px-0 md:px-16 z-[1]">
        {/* Hero Section */}
        <div
          ref={heroRef}
          className={`flex flex-col md:flex-row items-center justify-center flex-1 w-full gap-8 py-12 relative z-10 px-4 md:px-0 ${heroVisible ? 'fade-in' : 'opacity-0'}`}
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
            <p className="text-gray-200 text-lg mb-8">Alpha Snap is an AI tool built for the crypto space, helping you understand complex content in seconds. Upload a PDF or screenshot any crypto content - whitepapers, audits, threads, or on-chain data and get instant insights.</p>
            <ul className="space-y-3 mb-2">
              <li className="flex items-center bg-[#181818] rounded-xl px-4 py-3">
                <Image src="/branding/A_2D_digital_vector_illustration_features_a_green_ Background Removed.png" alt="Tick" width={28} height={28} className="mr-3" />
                <span className="text-[#e6ffe6] text-base">Summary in plain English (or degen-speak)</span>
              </li>
              <li className="flex items-center bg-[#181818] rounded-xl px-4 py-3">
                <Image src="/branding/A_2D_digital_vector_illustration_features_a_green_ Background Removed.png" alt="Tick" width={28} height={28} className="mr-3" />
                <span className="text-[#e6ffe6] text-base">Keywords & definitions (DePIN, restaking, MEV, etc.)</span>
              </li>
              <li className="flex items-center bg-[#181818] rounded-xl px-4 py-3">
                <Image src="/branding/A_2D_digital_vector_illustration_features_a_green_ Background Removed.png" alt="Tick" width={28} height={28} className="mr-3" />
                <span className="text-[#e6ffe6] text-base">Main argument or narrative (What are they actually saying?)</span>
              </li>
              <li className="flex items-center bg-[#181818] rounded-xl px-4 py-3">
                <Image src="/branding/A_2D_digital_vector_illustration_features_a_green_ Background Removed.png" alt="Tick" width={28} height={28} className="mr-3" />
                <span className="text-[#e6ffe6] text-base">Al chat assistant to explore further</span>
              </li>
            </ul>
          </div>
          {/* Right: Upload Area */}
          <div className="flex-1 max-w-md w-full">
            <UploadComponent standalone={false} />
          </div>
        </div>
        {/* Features Section (screenshot style) */}
        <section id="features" className="w-full max-w-6xl mx-auto my-4 px-4 md:px-0">
          <div
            ref={featuresRef}
            className={`flex flex-col md:flex-row gap-4 justify-center items-stretch ${featuresVisible ? 'fade-in' : 'opacity-0'}`}
          >
            {/* Step 1 */}
            <div className="flex-1 bg-[#181818] rounded-2xl p-8 flex flex-col items-start shadow-lg">
              <Image src="/imagess/UPLOAD FILE.png" alt="Upload" width={64} height={64} className="mb-6" />
              <div className="mb-2">
                <span className="text-xl font-bold"><span className="text-green-300 mr-2">Step 1:</span>Upload image or pdf file</span>
              </div>
              <p className="text-gray-300">Insert image of page&apos;s book or simply drag and drop PDF document</p>
            </div>
            {/* Step 2 */}
            <div className="flex-1 bg-[#181818] rounded-2xl p-8 flex flex-col items-start shadow-lg">
              <Image src="/imagess/ANALYZE IMAGE.png" alt="Analyze" width={64} height={64} className="mb-6" />
              <div className="mb-2">
                <span className="text-xl font-bold"><span className="text-green-300 mr-2">Step 2:</span>Our AI will analyze it</span>
              </div>
              <p className="text-gray-300">Alpha Snap will take care on the document by carefully analyzing it</p>
            </div>
            {/* Step 3 */}
            <div className="flex-1 bg-[#181818] rounded-2xl p-8 flex flex-col items-start shadow-lg">
              <Image src="/imagess/GET RESULTS.png" alt="Results" width={64} height={64} className="mb-6" />
              <div className="mb-2">
                <span className="text-xl font-bold"><span className="text-green-300 mr-2">Step 3:</span>Get results</span>
              </div>
              <p className="text-gray-300">Receive summary of provided document, keywords and argument of the content</p>
            </div>
            {/* Step 4 */}
            <div className="flex-1 bg-[#181818] rounded-2xl p-8 flex flex-col items-start shadow-lg">
              <Image src="/branding/A_flat_digital_vector_illustration_features_an_ico Background Removed.png" alt="Ask AI" width={64} height={64} className="mb-6" />
              <div className="mb-2">
                <span className="text-xl font-bold"><span className="text-green-300 mr-2">Step 4:</span>Ask AI</span>
              </div>
              <p className="text-gray-300">Still need more explanations? Ask chat widget powered by AI for better explanation</p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="w-full max-w-6xl mx-auto my-4 px-4 md:px-0">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left: Mission Text */}
            <div
              ref={missionRef}
              className="flex-1 bg-[#181818] rounded-3xl p-8 md:p-12 flex flex-col justify-center items-start bg-section-gradient"
            >
              <span className="inline-block bg-white text-[#111] text-xs font-bold rounded px-4 py-1 w-max shadow mb-6">Our mission</span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Make crypto knowledge accessible, actionable, and instant - for everyone.</h2>
              <p className="text-gray-300 text-lg">Alpha Snap exists to break down the barriers of complexity in crypto. By turning dense content into clear insights in seconds, we help users to make smarter decisions, move faster, and stay ahead of the curve – whether they&apos;re investors, builders, or curious degens.</p>
            </div>
            {/* Right: 3D Coin Image */}
            <div className="flex-1 bg-[#181818] rounded-3xl p-8 md:p-12 flex items-center justify-center">
              <Image src="/branding/missiontokenn.png" alt="Alpha Snap Coin" width={420} height={420} className="w-full max-w-[420px] h-auto rounded-2xl animate-pulse-grow" />
            </div>
          </div>
        </section>

        {/* About Section (image left, text right) */}
     

        {/* Coming Soon Features Section (side-scroll, reverted) */}
        <section id="coming-features" className="w-full max-w-6xl mx-auto my-4 px-4 md:px-0">
          <div
            ref={comingFeaturesRef}
            className={`flex space-x-4 overflow-x-auto hide-scrollbar${showScrollHint ? ' animate-scroll-hint' : ''}`}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: isDragging ? 'none' : 'auto' }}
            onMouseDown={e => {
              if (comingFeaturesRef.current) {
                setIsDragging(true);
                setDragStartX(e.pageX - comingFeaturesRef.current.offsetLeft);
                setScrollLeft(comingFeaturesRef.current.scrollLeft);
              }
            }}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={e => {
              if (!isDragging || !comingFeaturesRef.current || dragStartX === null) return;
              const x = e.pageX - comingFeaturesRef.current.offsetLeft;
              const walk = (x - dragStartX) * 1.2; // scroll speed
              comingFeaturesRef.current.scrollLeft = scrollLeft - walk;
            }}
          >
            {/* Row 1 */}
            <div className="w-[95vw] min-w-[320px] sm:min-w-[480px] sm:w-auto rounded-3xl p-6 md:p-12 flex flex-col gap-4 items-start bg-[#181818]">
              {/* Icon */}
              <div className="flex-shrink-0 flex items-start justify-center mb-2">
                <Image src="/branding/narrative.png" alt="Narrative Tracker Icon" width={65} height={59} style={{ height: 'auto' }} />
              </div>
              {/* Content */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-col gap-2">
                  <span className="inline-block bg-white text-[#111] text-xs font-bold rounded px-4 py-1 w-max shadow">Coming soon</span>
                  <h3 className="text-2xl font-extrabold text-white">Narrative Tracker / Buzz Radar</h3>
                  <p className="text-white/90 text-lg">Scan any screenshot, doc, or tweet to receive the following data:</p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#7DDA7D] text-transparent bg-clip-text">Narrative fit</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#7DDA7D] text-transparent bg-clip-text">Affected tokens or sectors</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#7DDA7D] text-transparent bg-clip-text">Historical context</span>
                  </div>
                
                  <div className="bg-white/90 rounded-xl px-5 py-3 mt-2">
                  <div className="text-xs font-bold text-gray-800 mb-1">Use case:</div>
                  <div className="text-sm text-gray-800">Great for investors, analysts, or researchers tracking narrative shifts in real time.</div>
                </div>
                </div>
              </div>
            </div>
            {/* Row 2 */}
            <div className="w-[95vw] min-w-[320px] sm:min-w-[480px] sm:w-auto rounded-3xl p-6 md:p-12 flex flex-col gap-4 items-start bg-[#181818]">
              {/* Icon */}
              <div className="flex-shrink-0 flex items-start justify-center mb-2">
                <Image src="/branding/flowexp.png" alt="DeFi Flow Explainer Icon" width={65} height={59} style={{ height: 'auto' }} />
              </div>
              {/* Content */}
              <div className="flex flex-col gap-2  w-full">
                <div className="flex flex-col gap-2">
                  <span className="inline-block bg-white text-[#111] text-xs font-bold rounded px-4 py-1 w-max shadow">Coming soon</span>
                  <h3 className="text-2xl font-extrabold text-white">DeFi Flow Explainer</h3>
                  <p className="text-white/90 text-lg">Upload a screenshot of a transaction or a snippet from a DeFi protocol doc to receive:</p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#7DDA7D] text-transparent bg-clip-text">Transaction breakdown</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#7DDA7D] text-transparent bg-clip-text">Protocols/contracts involved</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#7DDA7D] text-transparent bg-clip-text">Potential risks</span>
                  </div>
                </div>
                <div className="bg-white/90 rounded-xl px-5 py-3 mt-2">
                  <div className="text-xs font-bold text-gray-800 mb-1">Use case:</div>
                  <div className="text-sm text-gray-800">Useful for newer degens trying out a yield farm or bridging to Layer 2s.</div>
                </div>
              </div>
            </div>
            {/* Row 3 */}
            <div className="w-[95vw] min-w-[320px] sm:min-w-[490px] sm:w-auto rounded-3xl p-6 md:p-12 flex flex-col gap-4 items-start bg-[#181818]">
              {/* Icon */}
              <div className="flex-shrink-0 flex items-start justify-center mb-2">
                <Image src="/branding/smartpic.png" alt="Smart Contract TL;DR Icon" width={65} height={59} style={{ height: 'auto' }} />
              </div>
              {/* Content */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-col gap-2">
                  <span className="inline-block bg-white text-[#111] text-xs font-bold rounded px-4 py-1 w-max shadow">Coming soon</span>
                  <h3 className="text-2xl font-extrabold text-white">Smart Contract TL;DR</h3>
                  <p className="text-white/90 text-lg">Take a snippet from a contract (or a screenshot from an audit report) to receive:</p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#7DDA7D] text-transparent bg-clip-text">Plain English breakdown</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#7DDA7D] text-transparent bg-clip-text">Contract workflow</span>
                  </div>
                  <div className="bg-[#111] rounded-xl px-6 py-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[#95ED7F] via-[#7DDA7D] to-[#7DDA7D] text-transparent bg-clip-text">Potential red flags</span>
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

        <section id="token" className="w-full max-w-6xl mx-auto my-4 px-4 md:px-0">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left: 3D Coin Image */}
            <div className="flex-1 bg-[#181818] rounded-3xl p-8 md:p-12 flex items-center justify-center">
              <Image src="/branding/tokenimage.png" alt="Alpha Snap Coin" width={420} height={420} className="w-full max-w-[420px] h-auto rounded-2xl animate-pulse-grow" />
            </div>
            {/* Right: About Text */}
            <div
              ref={tokenRef}
              className="flex-1 bg-[#181818] rounded-3xl p-8 md:p-12 flex flex-col justify-center items-start bg-section-gradient"
            >
              <span className="inline-block bg-white text-[#111] text-xs font-bold rounded px-4 py-1 w-max shadow mb-6">$ALPHA Token</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Seamless Access, Flexible Payments, Community Powered.</h2>
              <p className="text-gray-300 text-lg mb-6">The $ALPHA token plays a central role in the Alpha Snap platform, enabling access to features, payment for services, and community participation.</p>
              {/* Contract Address Box */}
              <div className="flex items-center gap-3 bg-[#232323] rounded-xl px-5 py-4 mt-2 select-all group relative w-full max-w-[420px]">
                <span className="text-xs font-bold text-white bg-[#181818] rounded px-3 py-1 mr-2">CA</span>
                <span className="font-mono text-white text-base truncate flex-1" id="ca-address">25Ew9oMprcypdK2KbecFE6Btvy5HChaDYUmLdm7aLinK</span>
                <button
                  onClick={() => {
                    const addr = document.getElementById('ca-address')?.textContent;
                    if (addr) {
                      navigator.clipboard.writeText(addr);
                      setCaCopied(true);
                      setTimeout(() => setCaCopied(false), 3000);
                    }
                  }}
                  id="ca-copy-btn"
                  className="text-gray-400 hover:text-green-400 transition-colors p-1"
                  title="Copy address"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all">
                    <path d="M8 4v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7.242c0-.53-.21-1.039-.586-1.414l-1.242-1.242A2 2 0 0 0 16.758 4H10c-1.1 0-2 .9-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 18v2c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {caCopied && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-2.2rem] bg-green-700 text-white text-xs font-semibold rounded px-4 py-2 shadow z-20 animate-fade-in-out">
                  CA copied
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Utility Section (from Figma) */}
        <style jsx global>{`
          @keyframes utility-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .utility-slider-animate {
            animation: utility-marquee 20s linear infinite;
          }
          .utility-slider-paused {
            animation-play-state: paused !important;
          }
        `}</style>
        <section id="utility" className="w-full max-w-6xl mx-auto my-4 px-4 md:px-0">
          <div
            ref={utilitySliderRef}
            className="relative overflow-x-auto hide-scrollbar"
            style={{
              WebkitOverflowScrolling: 'touch',
              cursor: isUtilityDragging ? 'grabbing' : 'grab',
              userSelect: isUtilityDragging ? 'none' : 'auto',
            }}
            onMouseDown={e => {
              setIsUtilityDragging(true);
              setUtilityDragStartX(e.pageX - (utilitySliderRef.current?.offsetLeft || 0));
              setUtilityScrollLeft(utilitySliderRef.current?.scrollLeft || 0);
            }}
            onMouseLeave={() => setIsUtilityDragging(false)}
            onMouseUp={() => setIsUtilityDragging(false)}
            onMouseMove={e => {
              if (!isUtilityDragging || !utilitySliderRef.current || utilityDragStartX === null) return;
              const x = e.pageX - utilitySliderRef.current.offsetLeft;
              const walk = (x - utilityDragStartX) * 1.2;
              utilitySliderRef.current.scrollLeft = utilityScrollLeft - walk;
            }}
          >
            <div
              className="flex space-x-4 utility-slider-animate"
              onMouseEnter={e => e.currentTarget.classList.add('utility-slider-paused')}
              onMouseLeave={e => e.currentTarget.classList.remove('utility-slider-paused')}
              style={{ willChange: 'transform' }}
            >
              {/* Stake-to-Unlock */}
              <div className="w-[95vw] min-w-[320px] sm:min-w-[480px] sm:w-auto rounded-3xl p-12 flex flex-col gap-4 items-start bg-[#181818]" style={{ borderRadius: 24 }}>
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-2xl font-semibold bg-gradient-to-r from-[#136B0A] via-[#7DDA7D] to-[#058B05] text-transparent bg-clip-text">Stake-to-Unlock</span>
                  <p className="text-white/90 text-lg">Stake $ALPHA to access all core features of Alpha Snap, including unlimited content analysis, and full AI chat support.</p>
                </div>
              </div>
              {/* Pay-as-You-Go Credits */}
              <div className="w-[95vw] min-w-[320px] sm:min-w-[480px] sm:w-auto rounded-3xl p-12 flex flex-col gap-4 items-start bg-[#181818]" style={{ borderRadius: 24 }}>
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-2xl font-semibold bg-gradient-to-r from-[#136B0A] via-[#7DDA7D] to-[#058B05] text-transparent bg-clip-text">Pay-as-You-Go Credits</span>
                  <p className="text-white/90 text-lg">Use $ALPHA to buy credits for individual tasks — like summarizing large audits, scanning complex documents, generating deep-dive reports, or accessing Alpha Snap via API.</p>
                </div>
              </div>
              {/* Contribute-to-Earn */}
              <div className="w-[95vw] min-w-[320px] sm:min-w-[480px] sm:w-auto rounded-3xl p-12 flex flex-col gap-4 items-start bg-[#181818]" style={{ borderRadius: 24 }}>
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-2xl font-semibold bg-gradient-to-r from-[#136B0A] via-[#7DDA7D] to-[#058B05] text-transparent bg-clip-text">Contribute-to-Earn</span>
                  <p className="text-white/90 text-lg">Earn $ALPHA by helping improve the platform: tagging narratives, flagging risks, submitting training data, or suggesting improvements to AI output.</p>
                </div>
              </div>
              {/* Community Access & Rewards */}
              <div className="w-[95vw] min-w-[320px] sm:min-w-[480px] sm:w-auto rounded-3xl p-12 flex flex-col gap-4 items-start bg-[#181818]" style={{ borderRadius: 24 }}>
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-2xl font-semibold bg-gradient-to-r from-[#136B0A] via-[#7DDA7D] to-[#058B05] text-transparent bg-clip-text">Community Access & Rewards</span>
                  <p className="text-white/90 text-lg">Token holders gain access to exclusive community tools, early feature rollouts, and future ecosystem rewards.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Section */}
        <div className="w-full flex justify-center px-4 md:px-0">
          <div
            className="w-full max-w-6xl rounded-3xl p-0 flex flex-col md:flex-row items-stretch shadow-lg bg-[#181818] relative mx-auto"
            style={{ borderRadius: '24px', color: '#FFF', minHeight: 320 }}
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
                  <div className="flex flex-1 bg-[#191919] border border-[#1E1E1E] rounded-lg overflow-hidden min-h-[52px] max-w-[400px]">
                    <input
                      type="text"
                      required
                      placeholder="Enter your email address"
                      className="flex-1 rounded-lg px-4 py-2 border border-[#333] bg-[#232323] text-white focus:border-green-400 outline-none placeholder-white/40 text-base font-medium"
                      value={waitlistEmail}
                      onChange={e => setWaitlistEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                  >
                    Join waitlist now
                  </Button>
                </form>
              )}
            </div>
            {/* Right: Illustration */}
            <div className="hidden md:flex flex-col justify-center items-center pr-12 pl-0" style={{ minWidth: 244 }}>
              <Image src="/branding/singleeee.png" alt="bg" width={244} height={224} style={{ maxWidth: 244, maxHeight: 224 }} />
            </div>
          </div>
        </div>

        {/* Powered By Section */}
        <div className="px-4">
          <section
            ref={poweredRef}
            className={`w-full max-w-6xl px-8 py-8 mx-auto my-4 md:p-12 bg-[#181818] rounded-3xl ${poweredVisible ? 'fade-in' : 'opacity-0'}`}
            style={{
              backgroundImage: 'url(/branding/1stbg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <h2 className="text-4xl md:text-[2.5rem] font-extrabold mb-8 text-left">Powered by</h2>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-[#111] rounded-2xl flex flex-col items-center justify-center py-6 px-2 md:py-8 md:px-4 shadow-lg border border-[#232323]">
                <Image src="/branding/poweredchat.png" alt="Chat GPT" width={48} height={48} className="mb-4 md:w-[80px] md:h-[80px] w-[48px] h-[48px]" />
                <span className="text-white text-lg font-medium text-center">Chat GPT</span>
              </div>
              <div className="bg-[#111] rounded-2xl flex flex-col items-center justify-center py-6 px-2 md:py-8 md:px-4 shadow-lg border border-[#232323]">
                <Image src="/branding/poweredgemini.png" alt="Google Gemini" width={48} height={48} className="mb-4 md:w-[80px] md:h-[80px] w-[48px] h-[48px]" />
                <span className="text-white text-lg font-medium text-center">Google Gemini</span>
              </div>
              <div className="bg-[#111] rounded-2xl flex flex-col items-center justify-center py-6 px-2 md:py-8 md:px-4 shadow-lg border border-[#232323]">
                <Image src="/branding/poweredsolana.png" alt="Solana" width={48} height={48} className="mb-4 md:w-[80px] md:h-[80px] w-[48px] h-[48px]" />
                <span className="text-white text-lg font-medium text-center">Solana</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Section */}
        <footer className="w-full max-w-6xl mx-auto my-4 px-4 md:px-0">
          <div className="bg-[#181818] rounded-3xl flex flex-col md:flex-row items-center justify-between px-8 py-8 gap-8">
            {/* Left: Logo, Brand, Tagline, Copyright */}
            <div className="flex flex-col gap-4 items-start flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <Image src="/branding/newlogoalpha.png" alt="Alpha Snap Logo" width={130} height={35} className="w-[130px] h-auto"  />
              </div>
              <div className="text-2xl font-semibold text-white">Snap Anything, Get the $ALPHA</div>
              <div className="text-sm text-white/80">© 2025 LinkedNation.</div>
            </div>
            {/* Right: Icons and Disclaimer */}
            <div className="flex flex-col items-end gap-2 footer-mobile-items-start">
              <div className="flex flex-row items-center gap-6 mb-1">
                <a href="https://dexscreener.com/" target="_blank" rel="noopener noreferrer" aria-label="Dexscreener">
                  <Image src="/branding/dex-screener-seeklogo 1.png" alt="Dexscreener" width={24} height={32} className="w-7 h-7" />
                </a>
                <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X">
                  <Image src="/branding/xloo.png" alt="X" width={20} height={20} className="w-6 h-6" />
                </a>
              </div>
              <button
                type="button"
                className="text-white text-xs hover:underline focus:outline-none"
                onClick={() => setShowDisclaimer(true)}
              >
                Disclaimer
              </button>
            </div>
          </div>
        </footer>
        {/* Disclaimer Modal */}
        {showDisclaimer && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-opacity-70 backdrop-blur-sm">
            <div className="rounded-2xl bg-[#181818] p-8 w-[95vw] max-w-[420px] flex flex-col shadow-lg relative">
              <button
                className="absolute top-4 right-5 text-gray-400 hover:text-green-300 text-2xl font-bold"
                onClick={() => setShowDisclaimer(false)}
                aria-label="Close disclaimer"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-green-300 mb-4">Disclaimer</h2>
              <div className="text-white text-base mb-2">
                This website and its content are for informational purposes only and do not constitute financial, investment, or legal advice. Always do your own research before making any decisions. Alpha Snap and its creators are not responsible for any actions taken based on the information provided.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
