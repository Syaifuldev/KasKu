"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Caught by Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
      <div className="bg-red-500/10 text-red-500 p-6 rounded-2xl max-w-2xl text-left w-full border border-red-500/20">
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan!</h2>
        <p className="font-mono text-sm mb-4 whitespace-pre-wrap">{error.message || "Unknown Error"}</p>
        {error.stack && (
          <pre className="text-xs bg-black/20 p-4 rounded-lg overflow-auto max-h-64">
            {error.stack}
          </pre>
        )}
      </div>
      <Button onClick={() => reset()} variant="outline">
        Coba Lagi (Refresh)
      </Button>
    </div>
  );
}
