"use client";

import { useState } from "react";
import { OfferSection } from "./OfferSection";
import { PlanSection } from "./PlanSection";

export function ProposalContent() {
  const [tab, setTab] = useState<"offer" | "plan">("offer");

  return (
    <div className="mx-auto max-w-5xl">
      {/* Print-only header — the screen header is hidden when printing */}
      <div className="hidden print:block mb-6">
        <div className="text-[11px] font-bold tracking-[2px] text-[#e8442a]">86CONNECT CARS</div>
        <h1 className="mt-1 text-xl font-bold text-[#0f1419]">
          {tab === "offer" ? "Motorbike Expansion — Offer" : "Motorbike Expansion — Technical Plan"}
        </h1>
      </div>

      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-[#e5e9ee] bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <div
          className="px-6 py-8 text-white relative print:hidden"
          style={{
            background:
              "radial-gradient(120% 140% at 100% 0%, rgba(232,68,42,.22) 0%, rgba(232,68,42,0) 55%), linear-gradient(180deg,#10161d 0%,#1b2530 100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#e8442a] text-sm font-extrabold text-white">86</span>
            <span className="font-bold tracking-wide opacity-90">86CONNECT CARS</span>
            <button
              onClick={() => window.print()}
              className="ml-auto rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors print:hidden"
            >
              🖨️ Save as PDF
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-3">Motorbike Expansion — Offer &amp; Plan</h1>
          <p className="text-sm md:text-base text-[#c7d0d9] mt-1">
            Add motorbike selling &amp; export to your existing website.
          </p>
        </div>

        {/* Tab toggle — visible, always there */}
        <div className="flex items-center gap-2 border-b border-[#e5e9ee] bg-[#eef1f5] px-4 py-3 print:hidden">
          <button
            onClick={() => setTab("offer")}
            className={`flex-1 md:flex-none cursor-pointer rounded-lg border-2 px-5 py-2.5 text-sm font-bold shadow-sm transition-all active:scale-[.98] ${
              tab === "offer"
                ? "border-[#e8442a] bg-[#e8442a] text-white"
                : "border-[#cfd6de] bg-white text-[#333c46] hover:border-[#e8442a] hover:text-[#e8442a]"
            }`}
          >
            💼 Offer
          </button>
          <button
            onClick={() => setTab("plan")}
            className={`flex-1 md:flex-none cursor-pointer rounded-lg border-2 px-5 py-2.5 text-sm font-bold shadow-sm transition-all active:scale-[.98] ${
              tab === "plan"
                ? "border-[#e8442a] bg-[#e8442a] text-white"
                : "border-[#cfd6de] bg-white text-[#333c46] hover:border-[#e8442a] hover:text-[#e8442a]"
            }`}
          >
            📐 Technical Plan
          </button>
        </div>

        <div className="p-6">
          {tab === "offer" ? <OfferSection onSwitchPlan={() => setTab("plan")} /> : <PlanSection onSwitchOffer={() => setTab("offer")} />}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#5b6672] print:hidden">
        Shared privately with the owner of 86Connect Cars.
      </p>
    </div>
  );
}