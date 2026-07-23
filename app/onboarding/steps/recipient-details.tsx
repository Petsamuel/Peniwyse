"use client";

import { useState } from "react";
import FieldInput from "@/app/components/field-input";
import FieldSelect from "@/app/components/field-select";
import { NavButtons } from "../nav-buttons";

type WithdrawalMethod =
  | "Domestic Wire (Fedwire)"
  | "International Wire (SWIFT)"
  | "Crypto (USDT)";

export default function RecipientDetailsStep({
  tradingPartnerId,
  onNext,
  onPrev,
}: {
  tradingPartnerId: string;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [method, setMethod] = useState<WithdrawalMethod>(
    "Domestic Wire (Fedwire)",
  );
  const [currency, setCurrency] = useState("United States of America - USD");

  // Form States
  const [formData, setFormData] = useState({
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    accountName: "",
    bankName: "",
    bankStreet: "",
    bankCountry: "",
    walletChain: "",
    walletAddress: "",
  });

  const set = (k: keyof typeof formData, v: string) =>
    setFormData((p) => ({ ...p, [k]: v }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Recipient Details
        </h2>
        <p className="text-[10px] text-muted-theme mb-8 font-semibold uppercase tracking-wider">
          Settlement and Payout Information
        </p>

        <div className="flex flex-col gap-6">
          <FieldSelect
            placeholder="Currency *"
            value={currency}
            onChange={setCurrency}
            options={[
              "United States of America - USD",
              "Euro - EUR",
              "British Pound - GBP",
              // 'Nigerian Naira - NGN'
            ]}
          />

          <FieldSelect
            placeholder="Withdrawal Method *"
            value={method}
            onChange={(v) => setMethod(v as WithdrawalMethod)}
            options={[
              "Domestic Wire (Fedwire)",
              "International Wire (SWIFT)",
              "Crypto (USDT)",
            ]}
          />

          {/* Conditional Fields based on Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {method !== "Crypto (USDT)" && (
              <>
                <FieldInput
                  placeholder="Account Number / IBAN *"
                  value={formData.accountNumber}
                  onChange={(v) => set("accountNumber", v)}
                />
                {method === "Domestic Wire (Fedwire)" ? (
                  <FieldInput
                    placeholder="Routing Number *"
                    value={formData.routingNumber}
                    onChange={(v) => set("routingNumber", v)}
                  />
                ) : (
                  <FieldInput
                    placeholder="Swift Code *"
                    value={formData.swiftCode}
                    onChange={(v) => set("swiftCode", v)}
                  />
                )}
                <div className="md:col-span-2">
                  <FieldInput
                    placeholder="Account Name *"
                    value={formData.accountName}
                    onChange={(v) => set("accountName", v)}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldInput
                    placeholder="Bank Name *"
                    value={formData.bankName}
                    onChange={(v) => set("bankName", v)}
                  />
                </div>
              </>
            )}

            {method === "Crypto (USDT)" && (
              <>
                <FieldSelect
                  placeholder="Wallet Chain *"
                  value={formData.walletChain}
                  onChange={(v) => set("walletChain", v)}
                  options={[
                    "Ethereum (ERC20)",
                    "Tron (TRC20)",
                    "Solana",
                    "Polygon",
                  ]}
                />
                <FieldInput
                  placeholder="Wallet Address *"
                  value={formData.walletAddress}
                  onChange={(v) => set("walletAddress", v)}
                />
              </>
            )}
          </div>

          {/* Bank Address Section (Only for Fiat) */}
          {method !== "Crypto (USDT)" && (
            <div className="p-6 bg-surface-hover/50 rounded-2xl border border-border-theme flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
              <p className="text-[10px] font-bold text-muted-theme uppercase tracking-wider">
                Bank Address
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FieldInput
                  placeholder="Street Address *"
                  value={formData.bankStreet}
                  onChange={(v) => set("bankStreet", v)}
                />
                <FieldSelect
                  placeholder="Country *"
                  value={formData.bankCountry}
                  onChange={(v) => set("bankCountry", v)}
                  options={[
                    "United States",
                    "United Kingdom",
                    "Germany",
                    "Nigeria",
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <NavButtons onPrev={onPrev} onNext={onNext} nextLabel="Save & continue" />
    </div>
  );
}
