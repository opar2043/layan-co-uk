"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Loader2, Gift, Award, Users } from "lucide-react";
import {
  useWallet,
  useWalletTransactions,
  useTopupWallet,
  useRedeemWallet,
} from "@/hooks/useWallet";
import DataTable from "@/components/Dashboard/DataTable";
import StatusBadge from "@/components/Public/StatusBadge";
import StatCard from "@/components/Dashboard/StatCard";
import EmptyState from "@/components/Public/EmptyState";
import { formatCurrency, formatDateTime, idOf, toNumber } from "@/lib/utils";
import { WALLET_CREDIT_TYPES, WALLET_DEBIT_TYPES } from "@/lib/constants";

function BalanceCard({ label, value, icon: Icon, tone = "default" }) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-card ${
        tone === "accent" ? "bg-accent text-white" : "bg-surface"
      }`}
    >
      <p
        className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${
          tone === "accent" ? "text-white/80" : "text-muted-foreground"
        }`}
      >
        <Icon size={14} aria-hidden="true" />
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums sm:text-3xl">{formatCurrency(value ?? 0, { pence: true })}</p>
    </div>
  );
}

function ActionForm({ title, description, types, buttonLabel, onSubmit, isPending, tone = "outline" }) {
  const [type, setType] = useState(types[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handle = async (event) => {
    event.preventDefault();
    const value = toNumber(amount);
    if (Number.isNaN(value) || value <= 0) return;
    await onSubmit({ type, amount: value, ...(note.trim() ? { note: note.trim() } : {}) });
    setAmount("");
    setNote("");
  };

  return (
    <form onSubmit={handle} className="rounded-2xl bg-surface p-5 shadow-card">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor={`wallet-type-${tone}`} className="label">
            Type
          </label>
          <select
            id={`wallet-type-${tone}`}
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="input"
          >
            {types.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`wallet-amount-${tone}`} className="label">
            Amount
          </label>
          <input
            id={`wallet-amount-${tone}`}
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="25.00"
            className="input tabular-nums"
          />
        </div>

        <div>
          <label htmlFor={`wallet-note-${tone}`} className="label">
            Note <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id={`wallet-note-${tone}`}
            type="text"
            maxLength={140}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full ${tone === "accent" ? "btn-accent" : "btn-outline"}`}
        >
          {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}

export default function CustomerWallet() {
  const { data, isLoading, error } = useWallet();
  const { data: ledger, isLoading: ledgerLoading } = useWalletTransactions({ page: 1, limit: 20 });
  const topup = useTopupWallet();
  const redeem = useRedeemWallet();

  const wallet = data?.wallet ?? data;

  const columns = [
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (row) => <span className="whitespace-nowrap text-sm">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (row) => <StatusBadge status={row.type} label={row.type.replace(/_/g, " ")} />,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      className: "text-right font-semibold",
      render: (row) => (
        <span className={Number(row.amount) >= 0 ? "text-success" : "text-danger"}>
          {Number(row.amount) >= 0 ? "+" : ""}
          {formatCurrency(row.amount, { pence: true })}
        </span>
      ),
    },
    {
      key: "note",
      header: "Note",
      render: (row) => <span className="text-sm text-muted-foreground">{row.note || "—"}</span>,
    },
  ];

  if (error) {
    return <EmptyState icon={Wallet} title="Could not load your wallet" description={error.message} />;
  }

  const transactions = ledger?.items ?? [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Wallet</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Loyalty points, gift cards and referral credit in one place.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <BalanceCard label="Loyalty points" value={wallet?.loyaltyBalance} icon={Award} tone="accent" />
            <BalanceCard label="Gift card" value={wallet?.giftCardBalance} icon={Gift} />
            <BalanceCard label="Referral credit" value={wallet?.referralBalance} icon={Users} />
          </>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ActionForm
          title="Add credit"
          description="Record a top-up against your balance. Gift card and referral credit are tracked separately."
          types={WALLET_CREDIT_TYPES}
          buttonLabel="Add credit"
          tone="accent"
          isPending={topup.isPending}
          onSubmit={(payload) => topup.mutateAsync(payload)}
        />
        <ActionForm
          title="Redeem"
          description="Spend a balance. The API rejects a redemption larger than the balance you hold."
          types={WALLET_DEBIT_TYPES}
          buttonLabel="Redeem"
          isPending={redeem.isPending}
          onSubmit={(payload) => redeem.mutateAsync(payload)}
        />
      </div>

      <section aria-labelledby="ledger-heading">
        <h2 id="ledger-heading" className="mb-4 text-lg">
          Transaction history
        </h2>
        <DataTable
          columns={columns}
          rows={transactions}
          getRowId={(row) => idOf(row) ?? `${row.type}-${row.createdAt}`}
          loading={ledgerLoading}
          searchKeys={["type", "note"]}
          emptyTitle="No transactions yet"
          emptyDescription="Credits and redemptions will be listed here once you use your wallet."
          emptyIcon={Wallet}
        />
      </section>
    </div>
  );
}

export { StatCard, TrendingUp, TrendingDown };
