"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminTestimonials() {
  return (
    <CrudPage
      title="Testimonials"
      apiPath="testimonials"
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "role", label: "Role" },
        { key: "country", label: "Country" },
        { key: "flag", label: "Flag Emoji" },
        { key: "quote", label: "Quote", type: "textarea", required: true },
        { key: "avatar", label: "Avatar URL" },
        { key: "rating", label: "Rating", type: "number" },
      ]}
    />
  );
}
