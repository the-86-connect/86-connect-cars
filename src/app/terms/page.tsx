import type { Metadata } from "next";
import { PrivacyTermsContent } from "@/components/legal/PrivacyTermsContent";

export const metadata: Metadata = {
  title: "Terms of Service — 86Connect Cars",
  description:
    "The terms and conditions for using 86Connect Cars' vehicle sourcing, export, and shipping services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <PrivacyTermsContent type="terms" />;
}
