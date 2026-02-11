import { resources } from "@/config/resources";
import { getServerClient } from "@/lib/supabase/server";
import * as Icons from "lucide-react";

export default async function DashboardPage() {
  const supabase = await getServerClient();
  
  const stats = await Promise.all(
    resources.map(async (resource) => {
      const { count } = await supabase
        .from(resource.table)
        .select("*", { count: "exact", head: true });
      return {
        label: resource.plural,
        count: count || 0,
        icon: resource.icon,
      };
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           const Icon = (Icons as any)[stat.icon] || Icons.Box;
           return (
            <div key={stat.label} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.count}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                    <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
}
