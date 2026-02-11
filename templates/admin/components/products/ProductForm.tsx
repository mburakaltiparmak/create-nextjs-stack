"use client";

import ResourceFormClient from "@/components/admin/ResourceFormClient";
import { resources } from "@/config/resources";

interface ProductFormProps {
  mode: "create" | "update";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  id?: string;
}

export default function ProductForm({ mode, initialData, id }: ProductFormProps) {
  const config = resources.find((r) => r.name === "products")!;

  return (
    <ResourceFormClient
      config={config}
      mode={mode}
      initialData={initialData}
      id={id}
    />
  );
}
