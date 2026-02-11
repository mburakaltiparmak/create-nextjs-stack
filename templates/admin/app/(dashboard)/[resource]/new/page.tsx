import { resources } from "@/config/resources";
import { notFound, redirect } from "next/navigation";
import FormLayout from "@/components/admin/FormLayout";
import { createResource } from "@/app/actions/resources"; // We will create this
import ResourceFormClient from "@/components/admin/ResourceFormClient"; // Wrapper for logic

interface PageProps {
  params: {
    resource: string;
  };
}

export default function CreateResourcePage({ params }: PageProps) {
  const resourceName = params.resource;
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
