import type { Metadata } from "next";
import { PrivacyTermsContent } from "@/components/legal/PrivacyTermsContent";

export const metadata: Metadata = {
  title: "Privacy Policy — 86Connect Cars",
  description:
    "How 86Connect Cars collects, uses, and protects your personal information when you use our vehicle sourcing and export services.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyTermsContent type="privacy" />;
}
