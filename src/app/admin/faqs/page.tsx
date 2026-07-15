"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminFAQs() {
  return (
    <CrudPage
      title="FAQs"
      apiPath="faqs"
      fields={[
        { key: "question", label: "Question", required: true },
        { key: "answer", label: "Answer", type: "textarea", required: true },
      ]}
    />
  );
}
