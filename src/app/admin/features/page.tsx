"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminFeatures() {
  return (
    <CrudPage
      title="Features"
      apiPath="features"
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "icon", label: "Icon Name" },
      ]}
    />
  );
}
