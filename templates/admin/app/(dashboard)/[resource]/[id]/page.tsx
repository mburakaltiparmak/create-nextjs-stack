import { resources } from "@/config/resources";
import { notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import ResourceFormClient from "@/components/admin/ResourceFormClient";

interface PageProps {
  params: {
    resource: string;
    id: string;
  };
}

export default async function EditResourcePage({ params }: PageProps) {
  const resourceName = params.resource;
  const config = resources.find((r) => r.name === resourceName);

  if (!config) {
    return notFound();
  }

  const supabase = await getServerClient();
  const { data: item, error } = await supabase
    .from(config.table)
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !item) {
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
        id={params.id}
      />
    </div>
  );
}
