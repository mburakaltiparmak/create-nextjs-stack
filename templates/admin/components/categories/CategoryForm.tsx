"use client";

import ResourceFormClient from "@/components/admin/ResourceFormClient";
import { resources } from "@/config/resources";

interface CategoryFormProps {
  mode: "create" | "update";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  id?: string;
}

export default function CategoryForm({ mode, initialData, id }: CategoryFormProps) {
  const config = resources.find((r) => r.name === "categories")!;

  return (
    <ResourceFormClient
      config={config}
      mode={mode}
      initialData={initialData}
      id={id}
    />
  );
}
