import { CategoryService } from "@/lib/services/categories.service";
import { ProductService } from "@/lib/services/products.service";
import { ProjectService } from "@/lib/services/projects.service";
import { ClientService } from "@/lib/services/clients.service";
import { UserService } from "@/lib/services/users.service";
import { 
  Layers, 
  Package, 
  Briefcase, 
  Users, 
  Settings 
} from "lucide-react";

export default async function StatsGrid() {
  const [
    categories,
    products,
    projects,
    clients,
    users
  ] = await Promise.all([
    CategoryService.getAll(),
    ProductService.getAll(),
    ProjectService.getAll(),
    ClientService.getAll(),
    UserService.getAll()
  ]);

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Total Categories",
      value: categories.length,
      icon: Layers,
      color: "bg-purple-500",
    },
    {
      label: "Total Projects",
      value: projects.length,
      icon: Briefcase,
      color: "bg-indigo-500",
    },
    {
      label: "Total Clients",
      value: clients.length,
      icon: Users,
      color: "bg-pink-500",
    },
    {
      label: "Registered Users",
      value: users.length,
      icon: Settings,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label} 
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition hover:border-zinc-700 hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
