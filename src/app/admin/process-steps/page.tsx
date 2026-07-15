"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminProcessSteps() {
  return (
    <CrudPage
      title="Process Steps"
      apiPath="process-steps"
      fields={[
        { key: "step", label: "Step Number", type: "number", required: true },
        { key: "title", label: "Title", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "icon", label: "Icon Name" },
      ]}
    />
  );
}
