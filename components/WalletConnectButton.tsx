"use client";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function WalletConnectButton() {
  const { setVisible } = useWalletModal();
  const { publicKey, connected, disconnect } = useWallet();

  return (
    <div>
      {connected && publicKey ? (
        <div className="flex items-center gap-2">
          <span className="bg-[#232323] text-green-300 rounded px-3 py-1 text-sm font-mono">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </span>
          <button
            className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded"
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="bg-gradient-to-r from-green-400 to-green-200 text-black font-semibold rounded-lg px-5 py-2 shadow hover:brightness-110 transition-all text-sm"
          onClick={() => setVisible(true)}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
} 