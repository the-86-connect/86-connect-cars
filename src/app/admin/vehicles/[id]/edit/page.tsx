"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VehicleForm } from "@/components/admin/VehicleForm";

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then((r) => r.json())
      .then((data) => { setVehicle(data); setLoading(false); });
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!vehicle) return <p className="text-red-500">Vehicle not found</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Vehicle</h1>
      <VehicleForm initialData={vehicle} />
    </div>
  );
}
