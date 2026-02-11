import Link from "next/link";
import { getService } from "@/lib/services";
import ProjectList from "@/components/projects/ProjectList";
import { resources } from "@/config/resources";

export default async function ProjectsPage() {
  const service = getService("projects");
  const config = resources.find((r) => r.name === "projects")!;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: any[] = [];
  try {
    items = await service.getAll();
  } catch (error) {
    console.error(error);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Project
        </Link>
      </div>

      <ProjectList items={items} config={config} />
    </div>
  );
}
