"use client";

import ResourceFormClient from "@/components/admin/ResourceFormClient";
import { resources } from "@/config/resources";

interface UserFormProps {
  mode: "create" | "update";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  id?: string;
}

export default function UserForm({ mode, initialData, id }: UserFormProps) {
  const config = resources.find((r) => r.name === "users")!;

  return (
    <div>
        {mode === 'create' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Note: Creating a user here only creates a profile record. 
                            It does <strong>not</strong> create a login account. 
                            Use the Supabase Auth dashboard to invite users.
                        </p>
                    </div>
                </div>
            </div>
        )}
        <ResourceFormClient
            config={config}
            mode={mode}
            initialData={initialData}
            id={id}
        />
    </div>
  );
}
