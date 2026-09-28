"use client";

import { useState, useEffect } from "react";
import { OfferSection } from "./OfferSection";
import { PlanSection } from "./PlanSection";

const GATE_PASSWORD = "86connect-bikes-2026";

export function ProposalContent() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"offer" | "plan">("offer");

  // Auto-unlock from the shared ?k= link, or if this browser was already unlocked this session
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("k");
    if (key === GATE_PASSWORD || sessionStorage.getItem("proposal_unlocked") === "1") {
      sessionStorage.setItem("proposal_unlocked", "1");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnlocked(true);
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.trim() === GATE_PASSWORD) {
      setUnlocked(true);
      sessionStorage.setItem("proposal_unlocked", "1");
      setErr("");
    } else {
      setErr("Incorrect password");
    }
  };

  const logout = () => {
    setUnlocked(false);
    sessionStorage.removeItem("proposal_unlocked");
  };

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-[#e5e9ee] bg-white p-8 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#e8442a] text-sm font-extrabold text-white">86</span>
              <span className="font-bold tracking-wide text-[#0f1419]">86CONNECT</span>
            </div>
            <h1 className="text-xl font-bold text-[#0f1419]">Motorbike Expansion — Confidential</h1>
            <p className="text-sm text-[#5b6672] mt-2">
              This proposal is shared privately. Enter the access password below to view the offer and technical plan.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5b6672] mb-2">Access password</label>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-[#e5e9ee] bg-white px-4 py-3 text-sm text-[#0f1419] placeholder:text-[#b7bfc8] focus:border-[#e8442a] focus:outline-none focus:ring-2 focus:ring-[#e8442a]/20"
                autoFocus
              />
              {err && <p className="mt-2 text-sm text-[#e8442a]">{err}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#e8442a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c53922] transition-colors"
            >
              View proposal
            </button>
          </form>
          <p className="mt-5 text-xs text-[#5b6672]">
            If you need the password, contact Milton — md.milton@qq.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-[#e5e9ee] bg-white shadow-sm">
        <div
          className="px-6 py-8 text-white relative"
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
        <div className="flex border-b border-[#e5e9ee] bg-[#fbfcfd] print:hidden">
          <button
            onClick={() => setTab("offer")}
            className={`flex-1 md:flex-none px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              tab === "offer"
                ? "text-[#e8442a] border-[#e8442a]"
                : "text-[#5b6672] border-transparent hover:text-[#0f1419]"
            }`}
          >
            💼 Offer
          </button>
          <button
            onClick={() => setTab("plan")}
            className={`flex-1 md:flex-none px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              tab === "plan"
                ? "text-[#e8442a] border-[#e8442a]"
                : "text-[#5b6672] border-transparent hover:text-[#0f1419]"
            }`}
          >
            📐 Technical Plan
          </button>
          <button
            onClick={logout}
            className="ml-auto px-4 py-3 text-xs text-[#5b6672] hover:text-[#e8442a] transition-colors"
          >
            🔒 Lock
          </button>
        </div>

        <div className="p-6">
          {tab === "offer" ? <OfferSection onSwitchPlan={() => setTab("plan")} /> : <PlanSection onSwitchOffer={() => setTab("offer")} />}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#5b6672]">
        Confidential — shared privately with the owner of 86Connect Cars.
      </p>
    </div>
  );
}
