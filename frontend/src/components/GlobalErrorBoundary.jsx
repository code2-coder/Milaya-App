import { useRouteError } from "react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function GlobalErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  // Handle Vite dynamic import failure (when a new deployment happens)
  if (
    error?.message?.includes("Failed to fetch dynamically imported module") || 
    error?.message?.includes("Importing a module script failed")
  ) {
    const hasReloaded = sessionStorage.getItem("app_reloaded");
    if (!hasReloaded) {
      sessionStorage.setItem("app_reloaded", "true");
      window.location.reload();
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Updating application to the latest version...</p>
          </div>
        </div>
      );
    }
  }

  // Clear reload flag on successful load/different error
  sessionStorage.removeItem("app_reloaded");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Oops! Something went wrong</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          {error?.status === 404
            ? "The page you're looking for doesn't exist."
            : error?.message || "An unexpected error occurred. Our team has been notified."}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 w-full sm:w-auto"
        >
          <RefreshCw className="w-5 h-5" />
          Reload Application
        </button>
      </div>
    </div>
  );
}
