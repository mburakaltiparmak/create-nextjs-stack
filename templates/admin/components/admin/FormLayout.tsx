"use client";

import { useFormContext } from "react-hook-form";
import SubmitButton from "./SubmitButton";
import { getRelationOptions } from "@/app/actions/resources";
import { useEffect, useState } from "react";
import ImageUpload from "./ImageUpload";

interface FormLayoutProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: any[];
  title: string;
  isSubmitting: boolean;
}

export default function FormLayout({ fields, title, isSubmitting }: FormLayoutProps) {
  const { register, formState: { errors }, control, watch } = useFormContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [relationOptions, setRelationOptions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    // Fetch relation options
    fields.forEach(async (field) => {
      if (field.type === 'select' && field.relation) {
        try {
          const data = await getRelationOptions(
            field.relation.table,
            field.relation.display
          );
          setRelationOptions(prev => ({ ...prev, [field.name]: data }));
        } catch (error) {
          console.error('Failed to fetch options', error);
        }
      }
    });
  }, [fields]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                {...register(field.name)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            ) : field.type === 'boolean' ? (
              <input
                type="checkbox"
                {...register(field.name)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            ) : field.type === 'select' ? (
                <select
                {...register(field.name)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                <option value="">Select...</option>
                {field.options ? (
                    field.options.map((opt: { value: string; label: string }) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                    ))
                ) : (
                    relationOptions[field.name]?.map((opt: { id: string; [key: string]: string }) => (
                    <option key={opt.id} value={opt.id}>
                        {opt[field.relation!.display]}
                    </option>
                    ))
                )}
                </select>
            ) : field.type === 'image' ? (
                <ImageUpload 
                    name={field.name}
                    control={control}
                    defaultValue={watch(field.name)}
                />
            ) : (
              <input
                type={field.type}
                {...register(field.name)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            )}
            
            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[field.name]?.message as string}
              </p>
            )}
          </div>
        ))}

        <div className="pt-4">
          <SubmitButton
            isSubmitting={isSubmitting}
            label="Save"
            submittingLabel="Saving..."
          />
        </div>
      </div>
    </div>
  );
}
