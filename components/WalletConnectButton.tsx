"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import Image from "next/image";

const WALLET_ICONS: Record<string, string> = {
  Phantom: "/branding/phantom.svg",
  Metamask: "/branding/metamask.svg",
  Solflare: "/branding/solflare.svg",
  Torus: "/branding/torus.svg",
  Ledger: "/branding/ledger.svg",
  // Add more as needed
};

export default function WalletConnectButton() {
  const { publicKey, connected, disconnect, wallets, select, connect } = useWallet();
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      {connected && publicKey ? (
        <WalletDropdown publicKey={publicKey} disconnect={disconnect} />
      ) : (
        <>
          <button
            className="bg-gradient-to-r from-green-400 to-green-200 text-black font-semibold rounded-lg px-5 py-2 shadow hover:brightness-110 transition-all text-sm"
            onClick={() => setShowModal(true)}
          >
            Connect Wallet
          </button>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="rounded-2xl bg-[#181818] p-8 w-[540px] max-w-full flex flex-col shadow-lg relative">
                <button
                  className="absolute top-4 right-5 text-gray-400 hover:text-green-300 text-2xl font-bold"
                  onClick={() => setShowModal(false)}
                  aria-label="Close modal"
                >
                  ×
                </button>
                <h2 className="text-3xl font-bold text-green-300 mb-4">Connect your wallet</h2>
                <div className="text-white text-lg mb-4">Choose your wallet</div>
                <div className="grid grid-cols-2 gap-4">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      className="flex items-center gap-2 rounded-lg px-6 py-4 text-white font-medium text-lg transition-colors border border-[#232823]"
                      style={{
                        background: 'linear-gradient(90deg, rgba(149,237,127,0.2) 0%, rgba(125,218,125,0.2) 43%, rgba(255,255,255,0.2) 100%)',
                      }}
                      onClick={async () => {
                        await select(wallet.adapter.name);
                        await connect();
                        setShowModal(false);
                      }}
                    >
                      <Image src={WALLET_ICONS[wallet.adapter.name] || "/branding/phantom.svg"} alt={wallet.adapter.name} width={28} height={28} />
                      <span>{wallet.adapter.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// WalletDropdown component for connected users
function WalletDropdown({ publicKey, disconnect }: { publicKey: PublicKey, disconnect: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="bg-[#232323] text-green-300 rounded px-3 py-1 text-sm font-mono flex items-center gap-2"
        onClick={() => setOpen((v) => !v)}
      >
        {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="#95ED7F" strokeWidth="2"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#232323] border border-[#333] rounded-lg shadow-lg z-50">
          <a
            href="/analytics"
            className="block px-4 py-2 text-green-200 hover:bg-[#181818] rounded-t-lg"
            onClick={() => setOpen(false)}
          >
            View Analytics History
          </a>
          <button
            className="block w-full text-left px-4 py-2 text-red-400 hover:bg-[#181818] rounded-b-lg"
            onClick={() => { disconnect(); setOpen(false); }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
} 