import { resources } from "@/config/resources";
import { notFound } from "next/navigation";
import { getService } from "@/lib/services";
import ResourceFormClient from "@/components/admin/ResourceFormClient";

interface PageProps {
  params: Promise<{
    resource: string;
    id: string;
  }>;
}

export default async function EditResourcePage({ params }: PageProps) {
  const resolvedParams = await params;
  const resourceName = resolvedParams.resource;
  const config = resources.find((r) => r.name === resourceName);

  if (!config) {
    return notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let item: any = null;

  try {
    item = await getService(config.table).getById(resolvedParams.id);
  } catch (error) {
    console.error(`Error loading ${config.table} ${resolvedParams.id}:`, error);
  }

  if (!item) {
    return notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit {config.singular}</h1>
      </div>
      <ResourceFormClient
        config={config}
        mode="update"
        initialData={item}
        id={resolvedParams.id}
      />
    </div>
  );
}
