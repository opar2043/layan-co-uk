"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/** Customer wallet: balances plus an append-only transaction ledger. */

const keys = {
  wallet: ["wallet", "me"],
  transactions: (params) => ["wallet", "transactions", params],
};

export function useWallet({ enabled = true } = {}) {
  return useQuery({
    queryKey: keys.wallet,
    queryFn: () => api.get(API.walletMe),
    enabled,
  });
}

export function useWalletTransactions(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: keys.transactions(params),
    queryFn: () => api.get(API.walletTransactions(params)),
    enabled,
    placeholderData: (previous) => previous,
  });
}

/**
 * Credit side. `type` must be one of the credit types the backend allows:
 * `loyalty_earn`, `referral_credit`, `gift_card_topup`.
 */
export function useTopupWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(API.walletTopup, payload),
    onSuccess: () => {
      toast.success("Wallet credited");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error) => toast.error(error.message || "Could not credit the wallet"),
  });
}

/** Debit side. `type` is `loyalty_redeem` or `gift_card_redeem`; 400s if short. */
export function useRedeemWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(API.walletRedeem, payload),
    onSuccess: () => {
      toast.success("Wallet debited");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error) => toast.error(error.message || "Could not debit the wallet"),
  });
}

export default useWallet;
