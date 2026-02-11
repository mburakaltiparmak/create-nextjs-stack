import { getService } from "@/lib/services";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/projects/ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = getService("projects");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let item: any = null;
  try {
    item = await service.getById(id);
  } catch (error) {
    console.error(error);
  }

  if (!item) {
    return notFound();
  }

  return <ProjectForm mode="update" initialData={item} id={id} />;
}
