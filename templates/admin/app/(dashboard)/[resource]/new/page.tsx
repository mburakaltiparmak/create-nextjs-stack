import { resources } from "@/config/resources";
import { notFound } from "next/navigation";
import ResourceFormClient from "@/components/admin/ResourceFormClient";

interface PageProps {
  params: Promise<{
    resource: string;
  }>;
}

export default async function CreateResourcePage({ params }: PageProps) {
  const resolvedParams = await params;
  const resourceName = resolvedParams.resource;
  const config = resources.find((r) => r.name === resourceName);

  if (!config) {
    return notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create {config.singular}</h1>
      </div>
      <ResourceFormClient
        config={config}
        mode="create"
      />
    </div>
  );
}