"use client";

import { Control, Controller } from "react-hook-form";
import { Image as ImageIcon, Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadImage } from "@/app/actions/upload";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

interface ImageUploadProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  defaultValue?: string;
}

export default function ImageUpload({ name, control, defaultValue }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleUpload = async (file: File, onChange: (value: string) => void) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImage(formData);
      
      // Check if mounted before updating state
      if (!isMounted.current) return;

      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        onChange(result.url);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
       console.error(error);
       if (isMounted.current) toast.error("Upload failed");
    } finally {
      if (isMounted.current) setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0], onChange);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => {
        const currentImage = value || defaultValue;

        return (
          <div className="space-y-4">
            {!currentImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-white"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileInputChange(e, onChange)}
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                  ) : (
                    <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">
                            Click to upload image
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            SVG, PNG, JPG or GIF (max 5MB)
                        </p>
                    </>
                  )}
                </div>
            ) : (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group">
                    <Image
                        src={currentImage}
                        alt="Upload preview"
                        fill
                        className="object-contain"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Fallback Input for manual URL entry (optional, hidden by default but good for debugging or external URLs) */}
            <div className="mt-2 text-xs text-gray-400 flex justify-end">
                <button 
                    type="button" 
                    onClick={() => {
                        const url = prompt("Enter image URL manually:", currentImage);
                        if (url !== null) onChange(url);
                    }}
                    className="hover:underline"
                >
                    Enter URL manually
                </button>
            </div>
          </div>
        );
      }}
    />
  );
}
