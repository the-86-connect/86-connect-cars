"use client";

import { useSearchParams } from "next/navigation";
import { VehicleForm } from "@/components/admin/VehicleForm";

export default function NewVehiclePage() {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand");

  const initialData = brand ? { brand } : undefined;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {brand ? `Add New ${brand} Vehicle` : "Add New Vehicle"}
      </h1>
      <VehicleForm initialData={initialData} />
    </div>
  );
}
