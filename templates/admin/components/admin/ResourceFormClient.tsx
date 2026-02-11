"use client";

import { useForm, FormProvider } from "react-hook-form";
import FormLayout from "./FormLayout";
import { ResourceConfig } from "@/config/resources";
import { Trash2 } from "lucide-react";
import { useResource } from "@/hooks/useResource";

interface ResourceFormClientProps {
  config: ResourceConfig;
  mode: "create" | "update";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  id?: string;
}

export default function ResourceFormClient({
  config,
  mode,
  initialData,
  id,
}: ResourceFormClientProps) {
  const { create, update, remove, isSubmitting, isDeleting } = useResource(config);
  
  const methods = useForm({
    defaultValues: initialData || {},
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    if (mode === "create") {
      await create(data);
    } else {
      await update(id!, data);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {mode === 'update' && (
             <div className="flex justify-end mb-4">
                 <button 
                    type="button"
                    onClick={() => remove(id!)}
                    disabled={isDeleting}
                    className="flex items-center text-red-600 hover:text-red-800 px-3 py-2 rounded bg-red-50 hover:bg-red-100 transition-colors"
                 >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Record"}
                 </button>
             </div>
        )}
        <FormLayout
          fields={config.fields}
          title={`${mode === "create" ? "New" : "Edit"} ${config.singular}`}
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
