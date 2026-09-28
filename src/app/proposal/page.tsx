import { ProposalContent } from "./ProposalContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Motorbike Expansion — Confidential Proposal | 86Connect",
  robots: { index: false, follow: false },
};

export default function ProposalPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] py-12 px-4">
      <ProposalContent />
    </main>
  );
}
