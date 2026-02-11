"use client";

import ResourceFormClient from "@/components/admin/ResourceFormClient";
import { resources } from "@/config/resources";

interface ClientFormProps {
  mode: "create" | "update";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  id?: string;
}

export default function ClientForm({ mode, initialData, id }: ClientFormProps) {
  const config = resources.find((r) => r.name === "clients")!;

  return (
    <ResourceFormClient
      config={config}
      mode={mode}
      initialData={initialData}
      id={id}
    />
  );
}
