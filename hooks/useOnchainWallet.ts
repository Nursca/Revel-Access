"use client";

import { useContext } from "react";
import { WalletContext } from "@coinbase/onchainkit/wallet";

// fallback hook to access context safely
export function useOnchainWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useOnchainWallet must be used inside <Wallet>");
  }
  return context;
}
