'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4 font-outfit">
            <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-white/60 mb-8">We&apos;re sorry for the inconvenience.</p>
            <button
                onClick={reset}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 transition-colors font-bold rounded-md"
            >
                Try again
            </button>
        </div>
    );
}
