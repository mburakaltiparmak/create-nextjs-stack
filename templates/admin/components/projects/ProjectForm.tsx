"use client";

import ResourceFormClient from "@/components/admin/ResourceFormClient";
import { resources } from "@/config/resources";

interface ProjectFormProps {
  mode: "create" | "update";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  id?: string;
}

export default function ProjectForm({ mode, initialData, id }: ProjectFormProps) {
  const config = resources.find((r) => r.name === "projects")!;

  return (
    <ResourceFormClient
      config={config}
      mode={mode}
      initialData={initialData}
      id={id}
    />
  );
}
