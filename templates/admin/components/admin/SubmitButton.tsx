"use client";

import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  label: string;
  submittingLabel: string;
  className?: string;
}

export default function SubmitButton({
  isSubmitting,
  label,
  submittingLabel,
  className = "",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`flex items-center justify-center w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {submittingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
